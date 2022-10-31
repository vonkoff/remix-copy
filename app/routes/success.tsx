import { Link, useLoaderData } from '@remix-run/react';
import Stripe from 'stripe';
import type { Job } from '~/helpers/types';
import { destroySession, getSession } from '~/sessions.server';
import payForm from '../styles/payForm.css';
import blocks from '../styles/blocks.css';

export const links = () => [
  { rel: 'stylesheet', href: payForm },
  { rel: 'stylesheet', href: blocks },
];

const stripeSecret = process.env.STRIPE_SK as string;

const stripe = new Stripe(stripeSecret, {
  apiVersion: '2022-08-01',
  httpClient: Stripe.createFetchHttpClient(),
});

export const loader = async ({ request }: { request: Request }) => {
  console.log('In success loader');
  const url = new URL(request.url);
  const id = url.searchParams.get('session_id');
  console.log(id);
  const checkoutSession = await stripe.checkout.sessions.retrieve(id);
  // Since cookies set to lax need to only approve inserting job if cookies are verfied from our end
  if (!checkoutSession) {
    throw new Error('Did not come from Stripe Checkout Session');
  }

  const session = await getSession(request.headers.get('Cookie'));
  const company = await session.get('company');
  const position = await session.get('position');
  const image = await session.get('image');
  const city = await session.get('city');
  const state = await session.get('state');
  const employment = await session.get('employment');
  const minSalary = await session.get('minSalary');
  const maxSalary = await session.get('maxSalary');
  const benefits = await session.get('benefits');
  const description = await session.get('description');
  const urlJob = await session.get('url');
  const color = await session.get('color');
  const reciept_email = await session.get('receipt_email');

  console.log('email: ', reciept_email);
  console.log('company: ', company);
  console.log('position: ', position);
  console.log('image: ', image);
  console.log('city: ', city);
  console.log('state: ', state);
  console.log('employment: ', employment);
  console.log('minSalary: ', minSalary);
  console.log('maxSalary: ', maxSalary);
  console.log('benefits: ', benefits);
  console.log('description: ', description);
  console.log('url: ', urlJob);
  console.log('color: ', color);

  const salary = minSalary + ' - ' + maxSalary;
  console.log('salary: ', salary);

  let imageSplit = image.split(',');
  console.log('split image: ', imageSplit);

  // Have to pass this into prisma function. If it exists then just delete temp files
  // If it doesn't then change
  // ! Have to do regex somehow that checks daily and deletes any S3 objects that are like
  // ! "blank space"_NANO_ID.whatever and fit that format
  // ! Put the image into a bucket within S3 for uploading first time. If they never get here
  // ! delete them from time automatically

  const job: Job = {
    company: company,
    position: position,
    image: imageSplit,
    city: city,
    state: state,
    country: 'USA',
    employmentType: employment,
    salary: salary,
    benefits: benefits,
    description: description,
    url: urlJob,
    color: color,
  };

  // If successfull destroy session
  await destroySession(session);

  return checkoutSession;
};

export default function Index() {
  const customer: Stripe.Response<Stripe.Checkout.Session> = useLoaderData();
  const name = customer.customer_email as string;
  let amount = customer.amount_total as number;
  amount = amount / 100;
  return (
    <>
      <nav>
        <div className="pl-6 pt-4 w-28 sm:pl-2 sm:w-20">
          <Link
            to="/"
            className="font-Atkinson blocks border-[3px] border-black sm:text-sm text-xl transition ease-in-out delay-150 hover:-translate-y-1 hover:scale-110 duration-300"
            style={{ background: `#00ae86`, color: `white` }}
          >
            Home
          </Link>
        </div>
      </nav>
      <main className="mx-auto">
        <div className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 rounded p-8 border-2 border-black shadow-sm mt-4 mx-40 md:mx-20 sm:mx-4 ">
          <h1 className="text-sm font-black uppercase mb-4 -mt-8 flex justify-center md:text-xs">
            <span className="border-2 border-black p-1 mt-2 rounded-lg bg-yellow-400">
              Thank you!
            </span>
          </h1>
          <p className="font-Atkinson text-black text-lg mt-2  px-2 text-center">
            Charge: <strong>${amount}</strong>
            <br />
            You should be recieving an invoice to your <strong>
              {' '}
              {name}{' '}
            </strong>{' '}
            shortly. If there are any issues please contact us at
            info@goodunionjobs.com.
          </p>
        </div>
      </main>
    </>
  );
}
