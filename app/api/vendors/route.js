import dbConnect from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';

export const dynamic = 'force-dynamic';
import AdminLog from '@/lib/models/AdminLog';
import { isAdminRequest, adminDeniedResponse } from '@/lib/adminAuth';

export async function GET(request) {
    try {
        await dbConnect();
        const isAdmin = isAdminRequest(request);

        if (isAdmin) {
            const vendors = await Vendor.find({});
            return Response.json(vendors);
        }

        // Product commission is internal — list the product fields explicitly so
        // it never rides along with the public payload.
        const vendors = await Vendor.find({}).select(
            'name type types description image region price originalPrice discount discountType googleRating googleReviewsCount portfolio eventTypes reviews ' +
            'products.id products.name products.description products.price products.originalPrice products.image products.kind products.order products.active'
        );
        return Response.json(vendors);
    } catch (error) {
        return Response.json({ message: 'Error fetching vendors', error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    if (!isAdminRequest(request)) {
        return adminDeniedResponse();
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
