import dbConnect from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';

export const dynamic = 'force-dynamic';
import AdminLog from '@/lib/models/AdminLog';
import { isAdminRequest, adminDeniedResponse } from '@/lib/adminAuth';

export async function PUT(request, { params }) {
    if (!isAdminRequest(request)) {
        return adminDeniedResponse();
    }
    try {
        await dbConnect();
        const { id } = params;
        const body = await request.json();
        const updatedVendor = await Vendor.findByIdAndUpdate(id, body, { new: true });
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
    if (!isAdminRequest(request)) {
        return adminDeniedResponse();
    }
    try {
        await dbConnect();
        const { id } = params;
        const deletedVendor = await Vendor.findByIdAndDelete(id);
        if (deletedVendor) {
            AdminLog.log('delete', 'vendor', id);
            return Response.json({ success: true, message: 'Vendor deleted successfully' });
        } else {
            return Response.json({ message: 'Vendor not found' }, { status: 404 });
        }
    } catch (error) {
        return Response.json({ message: 'Error deleting vendor', error: error.message }, { status: 500 });
    }
}
