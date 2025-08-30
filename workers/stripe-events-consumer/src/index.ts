// Stripe Events Queue Consumer (Stub)
// This worker is not activated by default.
// It is safe to keep in the repo; Pages deploy ignores this worker.

export default {
  // Cloudflare Queues consumer handler (stub)
  async queue(batch: any, env: Record<string, unknown>, ctx: any) {
    try {
      const size = batch?.messages?.length ?? 0;
      console.log('[stripe-events-consumer] batch received:', size);
      for (const msg of batch?.messages ?? []) {
        const body = msg?.body ?? {};
        console.log('[stripe-events-consumer] message', {
          id: msg?.id,
          ts: msg?.timestamp,
          eventType: body?.eventType,
          eventId: body?.eventId,
        });
      }
      // Acknowledge implicitly by not throwing in this stub.
    } catch (e) {
      // In stub mode, swallow errors to avoid retries.
      console.error('[stripe-events-consumer] stub error (ignored):', e);
    }
  },
};
