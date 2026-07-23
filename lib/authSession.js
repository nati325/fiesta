export const TOKEN_COOKIE = 'fiesta_token';

export function setAuthCookie(response, token) {
    response.cookies.set(TOKEN_COOKIE, token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7,
        path: '/',
    });
    return response;
}

export function clearAuthCookie(response) {
    response.cookies.set(TOKEN_COOKIE, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0,
        path: '/',
    });
    return response;
}

export function getTokenFromRequest(request) {
    const authHeader = request.headers.get('authorization');
    if (authHeader?.startsWith('Bearer ')) {
        return authHeader.slice(7);
    }
    return request.cookies.get(TOKEN_COOKIE)?.value || null;
}
