import dbConnect from '@/lib/mongodb';
import Customer from '@/lib/models/Customer';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const { eventId } = params;

        const customer = await Customer.findOne({ eventId }).select(
            'name eventDate eventId status'
        );

        if (!customer) {
            return Response.json({ message: 'Event not found' }, { status: 404 });
        }

        return Response.json({
            eventId: customer.eventId,
            coupleName: customer.name,
            eventDate: customer.eventDate,
            status: customer.status
        });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 500 });
    }
}
