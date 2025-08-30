# Stripe Events Queue Consumer (Stub)

This is a non-activated stub for a Cloudflare Queue consumer Worker that will process Stripe webhook events asynchronously.

- No bindings are active by default.
- Safe to keep in repo; Pages deploy ignores this worker.
- When ready, uncomment the consumer binding in `wrangler.toml` and deploy the Worker separately.

## Queue Topology (planned)

- Producer: Pages Functions at `/webhooks/stripe` sends messages to `STRIPE_EVENTS_QUEUE` (if bound).
- Consumer: This Worker receives batches from `stripe-events` and processes them with retries.

## Local Setup (when activating later)

1. Create queues (one-time):

   ```sh
   wrangler queues create stripe-events
   wrangler queues create stripe-events-dlq
   ```

2. Configure consumer binding (uncomment in `wrangler.toml` here):

   ```toml
   # [[queues.consumers]]
   # queue = "stripe-events"
   # dead_letter_queue = "stripe-events-dlq"
   ```

3. Deploy this worker (separate from Pages):

   ```sh
   wrangler deploy
   ```

## Message Format (from producer)

```json
{
  "eventType": "checkout.session.completed",
  "eventId": "evt_...",
  "created": 1700000000,
  "session": { /* Stripe.Checkout.Session */ }
}
```

## Notes

- Keep processing idempotent using `eventId` as the primary key.
- Add durable locks / D1 mutexes only if necessary.
- This stub uses only logging and acknowledges messages implicitly by not throwing.

