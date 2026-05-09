import dbConnect from '@/lib/mongodb';
import Package from '@/lib/models/Package';

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const body = await request.json();
        const updated = await Package.findByIdAndUpdate(params.id, body, { new: true });
        if (!updated) return Response.json({ error: 'Not found' }, { status: 404 });
        return Response.json(updated);
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const deleted = await Package.findByIdAndDelete(params.id);
        if (!deleted) return Response.json({ error: 'Not found' }, { status: 404 });
        return Response.json({ ok: true });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 500 });
    }
}
