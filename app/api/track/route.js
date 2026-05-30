import dbConnect from '@/lib/mongodb';
export const dynamic = 'force-dynamic';
import Visit from '@/lib/models/Visit';
import { isAdminRequest, adminDeniedResponse } from '@/lib/adminAuth';

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const { page } = body;
        const visit = await Visit.create({
            date: new Date().toISOString().split('T')[0],
            page: page || '/'
        });
        return Response.json({ success: true, visit });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 400 });
    }
}

export async function GET(request) {
    if (!isAdminRequest(request)) {
        return adminDeniedResponse();
    }
    try {
        await dbConnect();
        const total = await Visit.countDocuments();
        
        // Stats for last 7 days
        const last7Days = {};
        const now = new Date();
        for (let i = 0; i < 7; i++) {
            const d = new Date(now);
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            last7Days[dateStr] = 0;
        }

        const recentVisits = await Visit.find({
            timestamp: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
        });

        recentVisits.forEach(v => {
            if (last7Days[v.date] !== undefined) {
                last7Days[v.date]++;
            }
        });

        // Top pages
        const topPagesRaw = await Visit.aggregate([
            { $group: { _id: '$page', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);
        const topPages = topPagesRaw.map(p => ({ page: p._id, count: p.count }));

        return Response.json({ total, last7Days, topPages });
    } catch (error) {
        return Response.json({ success: false, error: error.message }, { status: 500 });
    }
}
