import VendorModel from '@/lib/models/Vendor';
import AdminLog from '@/lib/models/AdminLog';

function isAdmin(request) {
    // TEMPORARY BYPASS FOR TESTING
    return true;
    // const token = request.headers.get('x-admin-token') || request.headers.get('authorization')?.split(' ')[1];
    // return token === 'fiesta-secret-admin-key-2025';
}

export async function GET() {
    try {
        const vendors = VendorModel.getAll();
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
        const body = await request.json();
        const { name, type, contact, description, image, region, price, discount, agreementSigned } = body;
        if (!name || !type || !contact) {
            return Response.json({ message: 'Missing required fields' }, { status: 400 });
        }
        const newVendor = VendorModel.create({ name, type, contact, description, image, region, price, discount, agreementSigned });
        AdminLog.log('add', 'vendor', newVendor.id, { name });
        return Response.json(newVendor, { status: 201 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}
