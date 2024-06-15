import { NextResponse, type NextRequest } from 'next/server';
import { createClient } from '@/utils/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabase, response } = await createClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (request.nextUrl.pathname.startsWith('/dashboard')) {
    // If user is not logged in then redirect to login page
    if (!user) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  const emailLinkError = 'Email link is invalid or has expired';
  // If email link is expired then redirect to signup page
  if (
    request.nextUrl.searchParams.get('error_description') === emailLinkError &&
    request.nextUrl.pathname !== '/signup'
  ) {
    return NextResponse.redirect(
      new URL(
        `/signup?error_description=${request.nextUrl.searchParams.get(
          'error_description',
        )}`,
        request.url,
      ),
    );
  }

  // If user is logged in then redirect to dashboard page
  if (['/login', '/signup'].includes(request.nextUrl.pathname)) {
    if (user) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
