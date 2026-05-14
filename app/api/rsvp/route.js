import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import RSVP from '@/lib/models/RSVP';

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        
        // Handle bulk import
        if (body.bulk && Array.isArray(body.guests)) {
            const eventId = body.eventId || 'default-event';
            const guestsToCreate = body.guests.map(g => ({
                eventId,
                name: g.name,
                phone: g.phone,
                invitationStatus: 'not_sent',
                isComing: false,
                guests: 0
            }));
            const created = await RSVP.insertMany(guestsToCreate);
            return NextResponse.json({ success: true, count: created.length }, { status: 201 });
        }

        // Handle single update (e.g. status change)
        if (body.updateId) {
            const updated = await RSVP.findByIdAndUpdate(body.updateId, body.updateData, { new: true });
            return NextResponse.json({ success: true, data: updated });
        }

        // Basic validation for single confirmation (original logic)
        if (!body.name || !body.phone || body.isComing === undefined) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        const rsvp = await RSVP.create({
            eventId: body.eventId || 'default-event',
            name: body.name,
            phone: body.phone,
            isComing: body.isComing,
            hasResponded: true,
            guests: body.isComing ? (body.guests || 1) : 0,
            veganCount: body.veganCount || 0,
            vegCount: body.vegCount || 0,
            dietary: body.dietary || '',
            shuttle: body.shuttle || false,
            message: body.message || ''
        });

        return NextResponse.json({ success: true, data: rsvp }, { status: 201 });
    } catch (error) {
        console.error('RSVP submission error:', error);
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}

export async function GET(request) {
    try {
        await dbConnect();
        const { searchParams } = new URL(request.url);
        const eventId = searchParams.get('eventId') || 'default-event';
        
        const rsvps = await RSVP.find({ eventId }).sort({ createdAt: -1 });
        return NextResponse.json(rsvps);
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
