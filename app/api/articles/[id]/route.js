import dbConnect from '@/lib/mongodb';
import Article from '@/lib/models/Article';

export const dynamic = 'force-dynamic';

export async function GET(request, { params }) {
    try {
        await dbConnect();
        const article = await Article.findById(params.id);
        if (!article) return Response.json({ message: 'Article not found' }, { status: 404 });
        return Response.json(article);
    } catch (error) {
        return Response.json({ message: 'Error fetching article', error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    try {
        await dbConnect();
        const body = await request.json();
        const updated = await Article.findByIdAndUpdate(params.id, body, { new: true });
        if (!updated) return Response.json({ message: 'Article not found' }, { status: 404 });
        return Response.json(updated);
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    try {
        await dbConnect();
        const deleted = await Article.findByIdAndDelete(params.id);
        if (!deleted) return Response.json({ message: 'Article not found' }, { status: 404 });
        return Response.json({ success: true, message: 'Article deleted successfully' });
    } catch (error) {
        return Response.json({ message: 'Error deleting article', error: error.message }, { status: 500 });
    }
}
