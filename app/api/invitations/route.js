import dbConnect from '@/lib/mongodb';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';

// ─── Invitation Schema ───────────────────────────────────────────────────────
const InvitationSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    template: { type: String, required: true },
    fields: { type: Object, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
});

const Invitation = mongoose.models.Invitation || mongoose.model('Invitation', InvitationSchema);

// ─── Auth helper ─────────────────────────────────────────────────────────────
function getUserFromRequest(request) {
    const auth = request.headers.get('authorization');
    if (!auth) return null;
    const token = auth.replace('Bearer ', '');
    try {
        return jwt.verify(token, SECRET_KEY);
    } catch {
        return null;
    }
}

// ─── GET: fetch user's invitations ──────────────────────────────────────────
export async function GET(request) {
    const user = getUserFromRequest(request);
    if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 });

    await dbConnect();
    const invitations = await Invitation.find({ userId: user.id }).sort({ updatedAt: -1 });
    return Response.json(invitations);
}

// ─── POST: save/update invitation ───────────────────────────────────────────
export async function POST(request) {
    const user = getUserFromRequest(request);
    if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await request.json();
    const { template, fields, id } = body;

    await dbConnect();

    if (id) {
        // Update existing
        const updated = await Invitation.findOneAndUpdate(
            { _id: id, userId: user.id },
            { template, fields, updatedAt: new Date() },
            { new: true }
        );
        return Response.json(updated);
    }

    // Create new
    const invitation = await Invitation.create({ userId: user.id, template, fields });
    return Response.json(invitation, { status: 201 });
}

// ─── DELETE ──────────────────────────────────────────────────────────────────
export async function DELETE(request) {
    const user = getUserFromRequest(request);
    if (!user) return Response.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return Response.json({ message: 'Missing id' }, { status: 400 });

    await dbConnect();
    await Invitation.findOneAndDelete({ _id: id, userId: user.id });
    return Response.json({ success: true });
}
