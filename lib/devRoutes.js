import { isAdminRequest, adminDeniedResponse } from '@/lib/adminAuth';

export function guardDevRoute(request) {
    if (process.env.NODE_ENV === 'production' && process.env.ALLOW_DEV_ROUTES !== 'true') {
        return Response.json({ message: 'Not available in production' }, { status: 404 });
    }
    if (!isAdminRequest(request)) {
        return adminDeniedResponse();
    }
    return null;
}
