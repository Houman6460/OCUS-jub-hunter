import { relations } from "drizzle-orm/relations";
import { orders, downloads, activationKeys, users, tickets, ticketMessages, customers, extensionUsageStats } from "./schema";

export const downloadsRelations = relations(downloads, ({one}) => ({
	order: one(orders, {
		fields: [downloads.orderId],
		references: [orders.id]
	}),
}));

export const ordersRelations = relations(orders, ({many}) => ({
	downloads: many(downloads),
	activationKeys: many(activationKeys),
}));

export const activationKeysRelations = relations(activationKeys, ({one}) => ({
	order: one(orders, {
		fields: [activationKeys.orderId],
		references: [orders.id]
	}),
}));

export const ticketsRelations = relations(tickets, ({one, many}) => ({
	user: one(users, {
		fields: [tickets.assignedToUserId],
		references: [users.id]
	}),
	ticketMessages: many(ticketMessages),
}));

export const usersRelations = relations(users, ({many}) => ({
	tickets: many(tickets),
}));

export const ticketMessagesRelations = relations(ticketMessages, ({one}) => ({
	ticket: one(tickets, {
		fields: [ticketMessages.ticketId],
		references: [tickets.id]
	}),
}));

export const extensionUsageStatsRelations = relations(extensionUsageStats, ({one}) => ({
	customer: one(customers, {
		fields: [extensionUsageStats.customerId],
		references: [customers.id]
	}),
}));

export const customersRelations = relations(customers, ({many}) => ({
	extensionUsageStats: many(extensionUsageStats),
}));