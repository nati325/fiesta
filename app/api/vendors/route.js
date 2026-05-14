import dbConnect from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';

export const dynamic = 'force-dynamic';
import AdminLog from '@/lib/models/AdminLog';

function isAdmin(request) {
    return request.headers.get('x-admin-token') === 'fiesta-secret-admin-key-2025';
}

export async function GET(request) {
    try {
        await dbConnect();
        const isAdmin = request.headers.get('x-admin-token') === 'fiesta-secret-admin-key-2025';

        if (isAdmin) {
            // Admin gets full data
            const vendors = await Vendor.find({});
            return Response.json(vendors);
        } else {
            // Public only gets safe fields - STRICT PROTECTION
            const vendors = await Vendor.find({}).select(
                'name type description image region price originalPrice discount discountType googleReviewsLink googleRating googleReviewsCount products portfolio'
            );
            return Response.json(vendors);
        }
    } catch (error) {
        return Response.json({ message: 'Error fetching vendors', error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    if (!isAdmin(request)) {
        return Response.json({ message: 'Access Denied' }, { status: 403 });
    }
    try {
        await dbConnect();
        const body = await request.json();
        const newVendor = await Vendor.create(body);
        AdminLog.log('add', 'vendor', newVendor._id, { name: newVendor.name });
        return Response.json(newVendor, { status: 201 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}
