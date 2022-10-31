import Stripe from 'stripe';
import { destroySession, getSession } from '~/sessions.server';
import type { Job, SessionImage } from '~/helpers/types';
import { InsertJob } from '~/helpers/prismaFunctions';

const stripeSecret = process.env.STRIPE_SK as string;

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2022-08-01',
  httpClient: Stripe.createFetchHttpClient(),
});

export async function createCheckoutSession(
  price: number,
  email: string
): Promise<string> {
  const success_url =
    process.env.NODE_ENV === 'production'
      ? 'http://goodunionjobs.com/success?session_id={CHECKOUT_SESSION_ID}'
      : 'http://localhost:3000/success?session_id={CHECKOUT_SESSION_ID}';

  const cancel_url =
    process.env.NODE_ENV === 'production'
      ? 'http://goodunionjobs.com/postjob'
      : 'http://localhost:3000/postjob';

  const session = await stripe.checkout.sessions.create({
    success_url: success_url,
    cancel_url: cancel_url,
    customer_email: email,
    mode: 'payment',
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: 'usd',
          unit_amount: price,
          product_data: {
            name: 'Job Post',
            // description: 'Comfortable cotton t-shirt',
            // images: ['https://example.com/t-shirt.png'],
          },
        },
      },
    ],
  });
  if (!session.url) {
    throw new Error('Session URL null');
  }
  return session.url;
}

export async function handleWebhook({ request }: { request: Request }) {
  const secret = process.env.STRIPE_WEBHOOK_SK as string;
  const sig = request.headers.get('stripe-signature') as string;
  let event;
  const payload = await request.text();

  try {
    event = stripe.webhooks.constructEvent(payload, sig, secret);
  } catch (err) {
    console.log(err);
    return new Response(err.message, {
      status: 400,
    });
  }

  console.log('request information: ', request);

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      console.log('payment success!  ');
      const paymentIntent = event.data.object;
      break;

    case 'payment_method.attached':
      const paymentMethod = event.data.object;
      // Then define and call a method to handle the successful attachment of a PaymentMethod.
      // handlePaymentMethodAttached(paymentMethod);
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  return {};
}
