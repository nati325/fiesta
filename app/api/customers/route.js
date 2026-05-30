import dbConnect from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';

export const dynamic = 'force-dynamic';
import AdminLog from '@/lib/models/AdminLog';
import { isAdminRequest, adminDeniedResponse } from '@/lib/adminAuth';
import { buildEventId } from '@/lib/eventId';

async function backfillEventIds() {
    const missing = await Customer.find({
        $or: [{ eventId: { $exists: false } }, { eventId: null }, { eventId: '' }]
    });
    await Promise.all(
        missing.map(c => Customer.findByIdAndUpdate(c._id, { eventId: buildEventId(c._id) }))
    );
}

export async function GET(request) {
    if (!isAdminRequest(request)) {
        return adminDeniedResponse();
    }
    try {
        await dbConnect();
        await backfillEventIds();
        const customers = await Customer.find({}).sort({ createdAt: -1 });
        return Response.json(customers);
    } catch (error) {
        return Response.json({ message: 'Error fetching customers', error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    if (!isAdminRequest(request)) {
        return adminDeniedResponse();
    }
    try {
        await dbConnect();
        const body = await request.json();
        const newCustomer = await Customer.create(body);
        if (!newCustomer.eventId) {
            newCustomer.eventId = buildEventId(newCustomer._id);
            await newCustomer.save();
        }
        AdminLog.log('add', 'customer', newCustomer._id, { name: newCustomer.name });
        return Response.json(newCustomer, { status: 201 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}
