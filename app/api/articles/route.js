import ArticleModel from '@/lib/models/Article';

function isAdmin(request) {
    // TEMPORARY BYPASS FOR TESTING
    return true;
}

export async function GET() {
    try {
        const articles = ArticleModel.getAll();
        return Response.json(articles);
    } catch (error) {
        return Response.json({ message: 'Error fetching articles', error: error.message }, { status: 500 });
    }
}

export async function POST(request) {
    if (!isAdmin(request)) {
        return Response.json({ message: 'Access Denied' }, { status: 403 });
    }
    try {
        const body = await request.json();
        const newArticle = ArticleModel.create(body);
        return Response.json(newArticle, { status: 201 });
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}
