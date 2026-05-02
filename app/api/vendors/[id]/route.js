import VendorModel from '@/lib/models/Vendor';
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
        const updatedVendor = VendorModel.update(id, body);
        if (updatedVendor) {
            AdminLog.log('edit', 'vendor', id, { name: updatedVendor.name });
            return Response.json(updatedVendor);
        } else {
            return Response.json({ message: 'Vendor not found' }, { status: 404 });
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
        const success = VendorModel.delete(id);
        if (success) {
            AdminLog.log('delete', 'vendor', id);
            return Response.json({ success: true, message: 'Vendor deleted successfully' });
        } else {
            return Response.json({ message: 'Vendor not found' }, { status: 404 });
        }
    } catch (error) {
        return Response.json({ message: 'Error deleting vendor', error: error.message }, { status: 500 });
    }
}
