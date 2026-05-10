import dbConnect from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';

export const dynamic = 'force-dynamic';
import AdminLog from '@/lib/models/AdminLog';

function isAdmin(request) {
    return true; // Bypass for now
}

export async function GET() {
    try {
        await dbConnect();
        const customers = await Customer.find({});
        return Response.json(customers);
    } catch (error) {
        return Response.json({ message: 'Error fetching customers', error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    if (!isAdmin(request)) {
        return Response.json({ message: 'Access Denied' }, { status: 403 });
    }
    try {
        await dbConnect();
        const body = await request.json();
        const newCustomer = await Customer.create(body);
        AdminLog.log('add', 'customer', newCustomer._id, { name: newCustomer.name });
        return Response.json(newCustomer, { status: 201 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}
