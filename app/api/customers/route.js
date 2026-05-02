import CustomerModel from '@/lib/models/Customer';
import AdminLog from '@/lib/models/AdminLog';

function isAdmin(request) {
    // TEMPORARY BYPASS FOR TESTING
    return true;
}

export async function GET() {
    try {
        const customers = CustomerModel.getAll();
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
        const { name, phone, status } = await request.json();
        if (!name || !phone || !status) {
            return Response.json({ message: 'Missing required fields' }, { status: 400 });
        }
        const newCustomer = CustomerModel.create({ name, phone, status });
        AdminLog.log('add', 'customer', newCustomer.id, { name });
        return Response.json(newCustomer, { status: 201 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}
