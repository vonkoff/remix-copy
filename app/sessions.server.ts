import { createCookie, createFileSessionStorage } from '@remix-run/node';
import { createUpstashSessionStorage } from '~/sessions/upstash.server';

// This will set the length of the session.
// For the example we use a very short duration to easily demonstrate its functionally.
const EXPIRATION_DURATION_IN_SECONDS = 14400; // 4 hours

const expires = new Date();
expires.setSeconds(expires.getSeconds() + EXPIRATION_DURATION_IN_SECONDS);

const sessionCookie = createCookie('__session', {
  secrets: ['r3m1xr0ck1'],
  sameSite: 'none',
  secure: true,
  expires,
});

const { getSession, commitSession, destroySession } =
  process.env.NODE_ENV === 'production'
    ? createFileSessionStorage({ cookie: sessionCookie, dir: './sessions' })
    : createUpstashSessionStorage({ cookie: sessionCookie });

export { getSession, commitSession, destroySession };
