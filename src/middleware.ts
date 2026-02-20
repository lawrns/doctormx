import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // Match only internationalized pathnames
  matcher: [
    // Match all pathnames except for
    // - /api routes
    // - /_next (Next.js internals)
    // - /_vercel (Vercel internals)
    // - /static (inside /public)
    // - all root files inside /public (e.g. /favicon.ico)
    '/((?!api|_next|_vercel|static|.*\\..*).*)',
    // Also match the root path
    '/'
  ]
};
