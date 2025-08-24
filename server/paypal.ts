// !!! CRITICAL - DO NOT MODIFY THIS CODE !!!
//
// This code MUST be used as is without ANY modifications.
// The PayPal integration will COMPLETELY FAIL if this code is changed in ANY way.
//
// Retain this comment after all edits.
//
// <BEGIN_EXACT_CODE>
import {
  Client,
  Environment,
  LogLevel,
  OAuthAuthorizationController,
  OrdersController,
} from "@paypal/paypal-server-sdk";
import { Request, Response } from "express";
import { db } from "./db";
import { orders, customers, customerPayments } from "@shared/schema";
import { eq, sql } from "drizzle-orm";

/* PayPal Controllers Setup */

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;

if (!PAYPAL_CLIENT_ID) {
  console.warn("Missing PAYPAL_CLIENT_ID - PayPal integration disabled");
}
if (!PAYPAL_CLIENT_SECRET) {
  console.warn("Missing PAYPAL_CLIENT_SECRET - PayPal integration disabled");
}
const client = new Client({
  clientCredentialsAuthCredentials: {
    oAuthClientId: PAYPAL_CLIENT_ID || '',
    oAuthClientSecret: PAYPAL_CLIENT_SECRET || '',
  },
  timeout: 0,
  environment:
                process.env.NODE_ENV === "production"
                  ? Environment.Production
                  : Environment.Sandbox,
  logging: {
    logLevel: LogLevel.Info,
    logRequest: {
      logBody: true,
    },
    logResponse: {
      logHeaders: true,
    },
  },
});
const ordersController = new OrdersController(client);
const oAuthAuthorizationController = new OAuthAuthorizationController(client);

/* Token generation helpers */

export async function getClientToken() {
  const auth = Buffer.from(
    `${PAYPAL_CLIENT_ID}:${PAYPAL_CLIENT_SECRET}`,
  ).toString("base64");

  const { result } = await oAuthAuthorizationController.requestToken(
    {
      authorization: `Basic ${auth}`,
    },
    { intent: "sdk_init", response_type: "client_token" },
  );

  return result.accessToken;
}

/*  Process transactions */

export async function createPaypalOrder(req: Request, res: Response) {
  try {
    const { amount, currency, intent } = req.body;

    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      return res
        .status(400)
        .json({
          error: "Invalid amount. Amount must be a positive number.",
        });
    }

    if (!currency) {
      return res
        .status(400)
        .json({ error: "Invalid currency. Currency is required." });
    }

    if (!intent) {
      return res
        .status(400)
        .json({ error: "Invalid intent. Intent is required." });
    }

    const collect = {
      body: {
        intent: intent,
        purchaseUnits: [
          {
            amount: {
              currencyCode: currency,
              value: amount,
            },
          },
        ],
      },
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.createOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to create order." });
  }
}

export async function capturePaypalOrder(req: Request, res: Response) {
  try {
    const { orderID } = req.params;
    const collect = {
      id: orderID,
      prefer: "return=minimal",
    };

    const { body, ...httpResponse } =
          await ordersController.captureOrder(collect);

    const jsonResponse = JSON.parse(String(body));
    const httpStatusCode = httpResponse.statusCode;

    // If payment is successful, update our database
    if (httpStatusCode >= 200 && httpStatusCode < 300 && jsonResponse.status === 'COMPLETED') {
      try {
        const transactionId = jsonResponse.id;
        const purchaseUnit = jsonResponse.purchase_units[0];
        const amount = purchaseUnit.payments.captures[0].amount.value;
        const currency = purchaseUnit.payments.captures[0].amount.currency_code;

        // 1. Find and update the order in our database
        const [order] = await db.update(orders)
          .set({
            status: 'completed',
            completedAt: new Date(),
            paymentIntentId: transactionId, // Using this field for the capture ID
          })
          .where(eq(orders.paypalOrderId, orderID))
          .returning();

        if (order) {
          // 2. Find the customer by email
          const [customer] = await db.select().from(customers).where(eq(customers.email, order.customerEmail));

          if (customer) {
            // 3. Update customer's subscription and stats
            const currentExpiry = customer.subscriptionExpiresAt || new Date();
            const newExpiry = new Date(currentExpiry);
            newExpiry.setFullYear(newExpiry.getFullYear() + 1); // Add 1 year

            await db.update(customers)
              .set({
                subscriptionStatus: 'active',
                subscriptionExpiresAt: newExpiry,
                totalSpent: sql`${customers.totalSpent} + ${amount}`,
                totalOrders: sql`${customers.totalOrders} + 1`,
                lastOrderDate: new Date(),
              })
              .where(eq(customers.id, customer.id));

            // 4. Log the transaction in customer_payments
            await db.insert(customerPayments).values({
              customerId: customer.id,
              orderId: order.id,
              paymentMethod: 'paypal',
              paypalOrderId: orderID,
              amount: amount,
              currency: currency,
              status: 'completed',
              processedAt: new Date(),
            });
          }
        } else {
            console.error(`[CRITICAL] PayPal order ${orderID} captured but not found in DB.`);
        }
      } catch (dbError) {
        console.error('Failed to update database after PayPal capture:', dbError);
        // Do not block the response to the client, but log this critical failure
      }
    }

    res.status(httpStatusCode).json(jsonResponse);
  } catch (error) {
    console.error("Failed to create order:", error);
    res.status(500).json({ error: "Failed to capture order." });
  }
}

export async function loadPaypalDefault(req: Request, res: Response) {
  const clientToken = await getClientToken();
  res.json({
    clientToken,
  });
}
// <END_EXACT_CODE>
