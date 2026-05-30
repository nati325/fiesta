import { NextResponse } from 'next/server';
import { TOKEN_COOKIE } from '@/lib/authSession';

export function middleware(request) {
    const { pathname } = request.nextUrl;

    if (!pathname.startsWith('/admin')) {
        return NextResponse.next();
    }

    const token = request.cookies.get(TOKEN_COOKIE)?.value;
    if (!token) {
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/:path*'],
};
