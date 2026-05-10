import dbConnect from '@/lib/mongodb';
import Article from '@/lib/models/Article';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        await dbConnect();
        const articles = await Article.find({}).sort({ createdAt: -1 });
        return Response.json(articles);
    } catch (error) {
        return Response.json({ message: 'Error fetching articles', error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    try {
        await dbConnect();
        const body = await request.json();
        const newArticle = await Article.create(body);
        return Response.json(newArticle, { status: 201 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}
