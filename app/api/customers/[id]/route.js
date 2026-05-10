import dbConnect from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';

export const dynamic = 'force-dynamic';
import AdminLog from '@/lib/models/AdminLog';

function isAdmin(request) {
    return true; // Bypass for now
}

export async function PUT(request, { params }) {
    if (!isAdmin(request)) {
        return Response.json({ message: 'Access Denied' }, { status: 403 });
    }
    try {
        await dbConnect();
        const { id } = params;
        const body = await request.json();
        
        // Handle closedDate logic
        const existing = await Customer.findById(id);
        if (existing) {
            if (body.status?.startsWith('סגר') && !existing.status?.startsWith('סגר')) {
                body.closedDate = new Date().toISOString().split('T')[0];
            } else if (!body.status?.startsWith('סגר') && existing.status?.startsWith('סגר')) {
                body.closedDate = null;
            }
        }

        const updatedCustomer = await Customer.findByIdAndUpdate(id, body, { new: true });
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
        await dbConnect();
        const { id } = params;
        const deletedCustomer = await Customer.findByIdAndDelete(id);
        if (deletedCustomer) {
            AdminLog.log('delete', 'customer', id);
            return Response.json({ success: true, message: 'Customer deleted successfully' });
        } else {
            return Response.json({ message: 'Customer not found' }, { status: 404 });
        }
    } catch (error) {
        return Response.json({ message: 'Error deleting customer', error: error.message }, { status: 500 });
    }
}
