import type { MetaFunction } from '@remix-run/node';
import {
  Links,
  Link,
  useCatch,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from '@remix-run/react';
import { DynamicLinks } from 'remix-utils';
import styles from './styles/tailwind.css';

import type { LoaderFunction } from '@remix-run/node';
import { json } from '@remix-run/node';
import { commitSession, getSession } from '~/sessions.server';
export const loader: LoaderFunction = async ({
  request,
}: {
  request: Request;
}) => {
  // Get the session from the cookie
  const session = await getSession(request.headers.get('Cookie'));
  const myStoredData = session.get('myStoredData');
  console.log('check if session saved #1:', myStoredData);
  // If no session found (was never created or was expired) create a new session.
  if (!myStoredData) {
    session.set('myStoredData', 'Some data');
    const myStoredDataif = session.get('myStoredData');
    console.log('checking if session saved #2:', myStoredDataif);
    console.log('CREATED NEW SESSION!');
    return json(
      {
        message: 'Created new session',
      },
      {
        headers: {
          'Set-Cookie': await commitSession(session),
        },
      }
    );
  }
  // If session was found, present the session info.
  return json({
    message: `Showing Session info: ${myStoredData}`,
  });
};

export const links = () => [{ rel: 'stylesheet', href: styles }];

export const meta: MetaFunction = () => ({
  charset: 'utf-8',
  title: 'Good Union Jobs',
  description:
    'GoodUnionJobs is a job directory that helps you explore your options, get trained, and get in touch with a union and an employer. Make your job work for you',
  'theme-color': '#ff8c00',
  viewport: 'width=device-width,initial-scale=1',
  'twitter:card': 'summary_large_image',
  'twitter:url': 'https://goodunionjobs.com',
  'twitter:title': 'GoodUnionJobs | Make your job work for you',
  'twitter:description':
    'GoodUnionJobs is a job directory that helps you explore your options, get trained, and get in touch with a union and an employer.',
  'twitter:image': 'https://goodunionjobs.com/assets/logo.png',
  'twitter:site': '@goodunionjobs',
  'twitter:creator': '@goodunionjobs',

  'og:site_name': 'Good Union Jobs',
  'og:description':
    'GoodUnionJobs is a job directory that helps you explore your options, get trained, and get in touch with a union and an employer.',
  'og:title': 'GoodUnionJobs | Make your job work for you',
  'og:image': 'https://goodunionjobs.com/assets/logo.jpg',
  'og:image:alt': 'GoodUnionJobs logo',
  'og:image:type': 'image/jpg',
  // 'og:image:width': '600',
  // 'og:image:height': '559',
  'og:url': 'https://goodunionjobs.com',
  /* <meta property="og:updated_time" content="2020-09-19T21:35:38+00:00" />
  <meta http-equiv="last-modified" content="2020-09-19T21:35:38+00:00"> */
  /* <meta name="last-modified" content="2020-09-19T21:35:38+00:00"> */
});

type Props = { children: React.ReactNode; title?: string };

export default function App({ children, title }: Props) {
  // https://schema.org/organization
  const organizationStructuredData = {
    '@context': 'http://schema.org',
    '@type': 'Organization',
    name: 'Good Union Jobs',
    naics: '5613',
    url: 'https://goodunionjobs.com',
    logo: 'https://goodunionjobs.com/assets/logo.png',
  };

  // console.log('Hi Reddit/roastmystartup!');
  return (
    <html lang="en">
      <head>
        <Meta />
        {title ? <title>{title}</title> : null}
        <DynamicLinks />
        <Links />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationStructuredData),
          }}
        />
        {/* Fathom - beautiful, simple website analytics */}
        {process.env.NODE_ENV === 'production' ? (
          <script
            src="https://cdn.usefathom.com/script.js"
            data-spa="auto"
            data-site="OIOGVQQC"
            defer
          />
        ) : (
          ''
        )}
      </head>
      <body className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-500 overflow-x-hidden">
        {children}
        <Outlet />
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function CatchBoundary() {
  const caught = useCatch();
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <main className="h-screen w-full flex flex-col justify-center items-center bg-cover">
        <div className="flex flex-col justify-center items-center bg-zinc-900/70 p-8 rounded-md">
          <video
            autoPlay
            loop
            muted
            style={{
              position: 'absolute',
              width: '100%',
              left: '50%',
              top: '50%',
              height: '100%',
              objectFit: 'cover',
              transform: 'translate(-50%, -50%)',
              zIndex: '-1',
            }}
          >
            <source src="../assets/hankhill-goaway.webm" type="video/webm" />
          </video>
          <h1 className="text-9xl font-extrabold text-white tracking-widest">
            {caught.status}
          </h1>
          <div className="bg-yellow-400 px-2 text-sm rounded rotate-12 absolute">
            {caught.statusText}
          </div>
          <button
            className="focus:outline-black text-white text-base uppercase font-bold 
          pt-2.5 pb-1.5 px-6 sm:px-4 sm:py-1.5 sm:pb:.5 border-b-4 
        border-yellow-600 bg-yellow-500 hover:bg-yellow-400 rounded-md "
          >
            <Link to="">Click to Go home</Link>
          </button>
        </div>
      </main>
    </html>
  );
}

export function ErrorBoundary({ error }) {
  console.error(error);
  return (
    <html>
      <head>
        <title>Oops!</title>
        <Meta />
        <Links />
      </head>
      <main className="h-screen w-full flex flex-col justify-center items-center bg-cover">
        <div className="flex flex-col justify-center items-center bg-zinc-900/70 p-8 rounded-md">
          <video
            autoPlay
            loop
            muted
            style={{
              position: 'absolute',
              width: '100%',
              left: '50%',
              top: '50%',
              height: '100%',
              objectFit: 'cover',
              transform: 'translate(-50%, -50%)',
              zIndex: '-1',
            }}
          >
            <source src="../assets/hankhill-goaway.webm" type="video/webm" />
          </video>
          <h1 className="text-4xl font-extrabold text-white tracking-widest">
            Unexpected error
          </h1>
          <div className="bg-yellow-400 px-2 text-sm rounded rotate-12 absolute mb-6">
            🔧💥🐒
          </div>
          <button
            className="focus:outline-black text-white text-base uppercase font-bold 
          pt-2.5 pb-1.5 px-6 sm:px-4 sm:py-1.5 sm:pb:.5 border-b-4 
        border-yellow-600 bg-yellow-500 hover:bg-yellow-400 rounded-md mt-4"
          >
            <Link to="">Click to Go home</Link>
          </button>
        </div>
      </main>
    </html>
  );
}
