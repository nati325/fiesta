import dbConnect from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';

export const dynamic = 'force-dynamic';
import AdminLog from '@/lib/models/AdminLog';

function isAdmin(request) {
    return true; // Bypass for now
}

export async function GET() {
    try {
        await dbConnect();
        const vendors = await Vendor.find({});
        return Response.json(vendors);
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
