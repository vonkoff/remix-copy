import type { ActionFunction } from '@remix-run/node';
import { Form, Link, useActionData } from '@remix-run/react';
import client from '@sendgrid/client';
import blocks from '../styles/blocks.css';

export const links = () => [{ rel: 'stylesheet', href: blocks }];

export const action: ActionFunction = async ({ request }) => {
  const apiKey =
    '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';
  client.setApiKey(apiKey);
  let formData = await request.formData();
  let email = formData.get('email') as string;
  const data = {
    contacts: [
      {
        email: email,
      },
    ],
  };

  let req = await client.request({
    method: 'PUT',
    url: '/v3/marketing/contacts',
    body: data,
  });

  let res = await client
    .request(req)
    .then(([response, body]) => {
      // console.log(response.statusCode);
      // console.log(response.body);
    })
    .catch((error) => {
      // console.error(error);
    });

  console.log('req', req[0].statusCode);

  return req[0].statusCode;
  // return 402;
};

export default function Newsletter() {
  let actionData = useActionData();
  console.log(actionData);

  let state: 'success' | 'idle' | 'error' =
    actionData === 202
      ? 'success'
      : actionData === undefined
      ? 'idle'
      : 'error';

  console.log('state', state);

  return (
    <>
      <nav>
        <div className="pl-6 pt-4 w-28 sm:pl-2 sm:w-20">
          <Link
            to="/"
            className="font-Atkinson blocks border-[3px] border-black sm:text-sm text-xl"
            style={{ background: `#00ae86`, color: `white` }}
          >
            Home
          </Link>
        </div>
      </nav>
      <div
        className={`flex flex-col min-h-full  items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-amber-50 mt-12 mx-12 sm:mt-4 sm:mx-4 rounded-md border`}
      >
        <div className="w-full max-w-md space-y-8">
          <img
            className="mx-auto h-24 w-auto"
            src="../../assets/logo.png"
            alt="Good Union Jobs logo"
          />
        </div>
        <Form
          className={`mt-8 space-y-6 ${state === 'success' ? 'hidden' : ''}`}
          method="post"
        >
          <fieldset>
            <div className="w-full max-w-md space-y-8 mb-4">
              <div>
                <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
                  Daily job postings to your inbox
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                  Sign up to know when our daily job posting notification system
                  is live
                </p>
              </div>
            </div>
            <div className="-space-y-px rounded-md shadow-sm">
              <div>
                <label htmlFor="email-address" className="sr-only">
                  Email address
                </label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-black focus:outline-none focus:ring-black sm:text-sm"
                  placeholder="Email address"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                className="group relative flex w-full mt-5 justify-center rounded-md border border-transparent bg-[#00ae86] py-2 px-4 text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-black focus:ring-offset-2"
              >
                Subscribe
              </button>
            </div>
            {/* Doesn't work for some reason when intentionally making error in Action function */}
            <p>{state === 'error' ? 'error' : <>&nbsp;</>}</p>
          </fieldset>
        </Form>
        <div className={`${state !== 'success' ? 'hidden' : ''} mt-8`}>
          <h2 className="text-center">You're subscribed!</h2>
          <p>Please check your email to confirm your subscription</p>
        </div>
      </div>
    </>
  );
}
