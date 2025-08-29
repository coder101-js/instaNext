
import { NextRequest, NextResponse } from 'next/server';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const token = req.cookies.get('admin-token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    try {
      // Verify the token
      const decoded = verify(token, JWT_SECRET) as { isAdmin: boolean };
      if (!decoded || !decoded.isAdmin) {
        throw new Error('Invalid admin token');
      }
      // Token is valid, allow the request to proceed
      return NextResponse.next();
    } catch (error) {
      // Token is invalid or expired
      const response = NextResponse.redirect(new URL('/admin/login', req.url));
      // Clear the invalid cookie
      response.cookies.delete('admin-token');
      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
