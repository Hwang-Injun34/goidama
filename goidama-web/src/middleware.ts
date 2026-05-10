import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 백엔드에서 설정한 쿠키 확인
  const refreshToken = request.cookies.get('refresh_token')?.value;

  // 보호가 필요한 경로들
  const isProtectedRoute = 
    pathname.startsWith('/home') || 
    pathname.startsWith('/capsule') || 
    pathname.startsWith('/notification') ||
    pathname.startsWith('/friend');

  // [로직 A] 로그인이 안 된 상태로 보호된 경로에 접근하면 로그인 페이지로 리다이렉트
  if (isProtectedRoute && !refreshToken) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // [중요] '로직 B(이미 로그인 시 홈으로)'를 제거했습니다. 
  // 클라이언트가 401 에러로 로그아웃 시켰을 때 미들웨어가 다시 홈으로 밀어내는 현상을 방지합니다.

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/home/:path*',
    '/capsule/:path*',
    '/notification/:path*',
    '/friend/:path*',
    '/login',
  ],
};