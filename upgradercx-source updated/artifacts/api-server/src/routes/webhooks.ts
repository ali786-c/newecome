import { Router, type Request, type Response, type NextFunction } from 'express';
import crypto from 'crypto';

const router = Router();

// ── Stripe Webhook ──────────────────────────────────────────────────────────
// Stripe sends raw body — must be consumed before express.json() parses it.
// Mount this BEFORE express.json() in app.ts using express.raw().
router.post(
  '/webhooks/stripe',
  (req: Request, res: Response, _next: NextFunction) => {
    const sig = req.headers['stripe-signature'] as string | undefined;
    const secret = process.env['STRIPE_WEBHOOK_SECRET'];

    // Signature verification (requires raw body — use express.raw() upstream)
    if (secret && sig) {
      try {
        const rawBody = (req as any).rawBody as Buffer | undefined;
        if (rawBody) {
          const expectedSig = crypto
            .createHmac('sha256', secret)
            .update(rawBody)
            .digest('hex');
          const provided = sig.split(',').find((p) => p.startsWith('v1='))?.slice(3);
          if (provided !== expectedSig) {
            res.status(400).json({ error: 'Invalid Stripe signature' });
            return;
          }
        }
      } catch {
        res.status(400).json({ error: 'Signature verification failed' });
        return;
      }
    }

    const event = req.body as { type: string; data: { object: Record<string, unknown> } };
    console.log(`[Stripe Webhook] Event: ${event.type}`);

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object;
        console.log(`[Stripe] Payment succeeded: ${pi['id']} amount: ${pi['amount']}`);
        // TODO: Find order by metadata.order_id, mark as paid, trigger auto-delivery
        break;
      }
      case 'payment_intent.payment_failed': {
        const pi = event.data.object;
        console.log(`[Stripe] Payment failed: ${pi['id']}`);
        // TODO: Find order by metadata.order_id, mark as cancelled
        break;
      }
      case 'charge.refunded': {
        const charge = event.data.object;
        console.log(`[Stripe] Charge refunded: ${charge['id']}`);
        // TODO: Find order by charge metadata, mark as refunded, revoke seat
        break;
      }
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log(`[Stripe] Subscription cancelled: ${sub['id']}`);
        break;
      }
      default:
        console.log(`[Stripe Webhook] Unhandled event: ${event.type}`);
    }

    res.json({ received: true });
  }
);

// ── PayPal Webhook ──────────────────────────────────────────────────────────
router.post('/webhooks/paypal', (req: Request, res: Response) => {
  const body = req.body as { event_type: string; resource: Record<string, unknown> };

  // PayPal webhook verification would use PayPal SDK in production
  // Verify using: PAYPAL-TRANSMISSION-ID, PAYPAL-CERT-URL, PAYPAL-TRANSMISSION-SIG headers
  const transmissionId = req.headers['paypal-transmission-id'];
  console.log(`[PayPal Webhook] Event: ${body.event_type} tx:${transmissionId}`);

  switch (body.event_type) {
    case 'PAYMENT.CAPTURE.COMPLETED': {
      const resource = body.resource;
      const orderId = (resource['supplementary_data'] as any)?.related_ids?.order_id;
      console.log(`[PayPal] Payment captured. Order: ${orderId}`);
      // TODO: mark order as paid, trigger auto-delivery from Product Vault
      break;
    }
    case 'PAYMENT.CAPTURE.REFUNDED': {
      const resource = body.resource;
      console.log(`[PayPal] Refund processed: ${resource['id']}`);
      // TODO: mark order refunded
      break;
    }
    case 'PAYMENT.CAPTURE.DENIED': {
      console.log('[PayPal] Payment denied');
      break;
    }
    default:
      console.log(`[PayPal Webhook] Unhandled: ${body.event_type}`);
  }

  res.json({ received: true });
});

// ── NOWPayments (Crypto) Webhook ───────────────────────────────────────────
router.post('/webhooks/nowpayments', (req: Request, res: Response) => {
  const ipnSecret = process.env['NOWPAYMENTS_IPN_SECRET'];
  const sigHeader = req.headers['x-nowpayments-sig'] as string | undefined;

  // HMAC-SHA512 verification
  if (ipnSecret && sigHeader) {
    const payload = JSON.stringify(
      Object.keys(req.body as Record<string, unknown>)
        .sort()
        .reduce((sorted, key) => ({ ...sorted, [key]: (req.body as Record<string, unknown>)[key] }), {})
    );
    const expectedSig = crypto.createHmac('sha512', ipnSecret).update(payload).digest('hex');
    if (expectedSig !== sigHeader) {
      console.warn('[NOWPayments] Invalid IPN signature');
      res.status(400).json({ error: 'Invalid signature' });
      return;
    }
  }

  const body = req.body as {
    payment_id: string;
    payment_status: string;
    order_id: string;
    price_amount: number;
    price_currency: string;
    pay_amount: number;
    pay_currency: string;
  };

  console.log(`[NOWPayments] Payment ${body.payment_id} status: ${body.payment_status} order: ${body.order_id}`);

  switch (body.payment_status) {
    case 'finished':
    case 'confirmed': {
      console.log(`[NOWPayments] Crypto payment confirmed. Order: ${body.order_id}, Amount: ${body.pay_amount} ${body.pay_currency}`);
      // TODO: mark order as paid, auto-deliver from Product Vault
      break;
    }
    case 'partially_paid': {
      console.log(`[NOWPayments] Partial payment received for Order: ${body.order_id}`);
      // TODO: flag order for review
      break;
    }
    case 'failed':
    case 'refunded': {
      console.log(`[NOWPayments] Payment ${body.payment_status}: Order ${body.order_id}`);
      // TODO: update order status accordingly
      break;
    }
    default:
      console.log(`[NOWPayments] Unhandled status: ${body.payment_status}`);
  }

  res.json({ received: true });
});

// ── Supplier Price Proxy ────────────────────────────────────────────────────
// Server-side proxy for supplier price fetching (bypasses browser CORS).
router.get('/proxy/supplier-prices', async (req: Request, res: Response) => {
  try {
    const { q, country = 'US', currency = 'USD', page_size = '20' } = req.query as Record<string, string>;
    if (!q) { res.status(400).json({ error: 'Missing query parameter q' }); return; }

    const SUPPLIER_API_BASE = process.env.SUPPLIER_API_BASE;
    if (!SUPPLIER_API_BASE) { res.status(503).json({ error: 'Supplier API not configured' }); return; }
    const url = new URL(SUPPLIER_API_BASE);
    url.searchParams.set('service_id', process.env.SUPPLIER_SERVICE_ID || 'lgc_game_item');
    url.searchParams.set('q', q);
    url.searchParams.set('country', country);
    url.searchParams.set('currency', currency);
    url.searchParams.set('page_size', page_size);

    const response = await fetch(url.toString(), {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; UpgraderCX-PriceSync/1.0)',
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      res.status(response.status).json({ error: 'Supplier upstream error', status: response.status });
      return;
    }

    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('[Supplier Proxy] Error:', err);
    res.status(502).json({ error: 'Supplier proxy request failed' });
  }
});

export default router;
