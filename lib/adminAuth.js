import jwt from 'jsonwebtoken';
import { getTokenFromRequest } from '@/lib/authSession';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';
const ADMIN_API_TOKEN =
    process.env.ADMIN_API_TOKEN || process.env.ADMIN_TOKEN || 'fiesta-secret-admin-key-2025';

export function isAdminRequest(request) {
    const headerToken = request.headers.get('x-admin-token');
    if (headerToken && headerToken === ADMIN_API_TOKEN) {
        return true;
    }

    const bearer = getTokenFromRequest(request);
    if (!bearer) {
        return false;
    }

    try {
        const decoded = jwt.verify(bearer, SECRET_KEY);
        return decoded.isAdmin === true;
    } catch {
        return false;
    }
}

export function adminDeniedResponse() {
    return Response.json({ message: 'Access Denied' }, { status: 403 });
}
