import dbConnect from '@/lib/mongodb';
import Package from '@/lib/models/Package';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const packages = await Package.find({}).sort({ createdAt: -1 });
        return Response.json(packages);
    } catch (error) {
        return Response.json({ message: 'Error fetching packages', error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const newPackage = await Package.create(body);
        return Response.json(newPackage, { status: 201 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}
