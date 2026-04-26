import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from './lib/auth';

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const user = await getUserFromToken(token);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Add user to request for use in routes
  (request as any).user = user;
  return NextResponse.next();
}

export const config = {
  matcher: ['/api/auth/profile/:path*', '/api/categorias/:path*', '/api/activos/:path*'], // Apply to profile, categorias, and activos routes
};