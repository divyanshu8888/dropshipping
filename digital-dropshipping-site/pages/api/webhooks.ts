import { NextApiRequest, NextApiResponse } from 'next';
import { buffer } from 'micro';
import { verifySignature } from '../../lib/stripe';

export const config = {
  api: {
    bodyParser: false,
  },
};

const webhookHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = verifySignature(buf, sig);
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  switch (event.type) {
    case 'payment_intent.succeeded':
      // Handle successful payment intent
      break;
    case 'payment_intent.payment_failed':
      // Handle failed payment intent
      break;
    // Add more event types as needed
    default:
      console.warn(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
};

export default webhookHandler;