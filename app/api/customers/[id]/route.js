import CustomerModel from '@/lib/models/Customer';
import AdminLog from '@/lib/models/AdminLog';

function isAdmin(request) {
    // TEMPORARY BYPASS FOR TESTING
    return true;
}

export async function PUT(request, { params }) {
    if (!isAdmin(request)) {
        return Response.json({ message: 'Access Denied' }, { status: 403 });
    }
    try {
        const { id } = params;
        const body = await request.json();
        const updatedCustomer = CustomerModel.update(id, body);
        if (updatedCustomer) {
            AdminLog.log('edit', 'customer', id, { name: updatedCustomer.name });
            return Response.json(updatedCustomer);
        } else {
            return Response.json({ message: 'Customer not found' }, { status: 404 });
        }
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    if (!isAdmin(request)) {
        return Response.json({ message: 'Access Denied' }, { status: 403 });
    }
    try {
        const { id } = params;
        const success = CustomerModel.delete(id);
        if (success) {
            AdminLog.log('delete', 'customer', id);
            return Response.json({ success: true, message: 'Customer deleted successfully' });
        } else {
            return Response.json({ message: 'Customer not found' }, { status: 404 });
        }
    } catch (error) {
        return Response.json({ message: 'Error deleting customer', error: error.message }, { status: 500 });
    }
}
