import { NextRequest, NextResponse } from 'next/server';

/**
 * Route Guard Middleware — adakamar.id
 * 
 * PRD Seksi 17 & 26: 
 * - Penulis tidak bisa akses /admin → Forbidden/Redirect
 * - Admin dan Penulis harus login untuk akses area masing-masing
 */

// Parse JWT payload tanpa library (Edge Runtime compatible)
function parseJwtPayload(token: string): Record<string, any> | null {
  try {
    const base64Payload = token.split('.')[1];
    if (!base64Payload) return null;
    // Decode base64url
    const base64 = base64Payload.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = atob(base64);
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ambil token dari cookie atau Authorization header
  // Token disimpan di localStorage di browser — kita tidak bisa baca dari middleware
  // Tapi kita bisa set cookie saat login untuk keperluan middleware
  // Strategi: cek cookie 'adakamar_role' yang di-set saat login
  const roleCookie = request.cookies.get('adakamar_role')?.value;
  const tokenCookie = request.cookies.get('adakamar_token')?.value;

  // Jika ada token di cookie, parse role-nya
  let userRole: string | null = roleCookie || null;
  if (!userRole && tokenCookie) {
    const payload = parseJwtPayload(tokenCookie);
    userRole = payload?.role || null;
  }

  // === PROTEKSI HALAMAN ADMIN ===
  if (pathname.startsWith('/admin')) {
    // Jika tidak ada token / tidak login → redirect ke login
    if (!tokenCookie && !roleCookie) {
      const loginUrl = new URL('/masuk', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }

    // Jika role adalah PENULIS → Forbidden, redirect ke halaman penulis
    if (userRole === 'PENULIS') {
      const forbiddenUrl = new URL('/penulis', request.url);
      forbiddenUrl.searchParams.set('error', 'forbidden');
      return NextResponse.redirect(forbiddenUrl);
    }
  }

  // === PROTEKSI HALAMAN PENULIS ===
  if (pathname.startsWith('/penulis')) {
    // Jika tidak ada token → redirect ke login
    if (!tokenCookie && !roleCookie) {
      const loginUrl = new URL('/masuk', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  // Jalankan middleware hanya untuk route yang relevan
  matcher: [
    '/admin/:path*',
    '/penulis/:path*',
  ],
};
