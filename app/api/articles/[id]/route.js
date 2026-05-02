import ArticleModel from '@/lib/models/Article';

function isAdmin(request) {
    // TEMPORARY BYPASS FOR TESTING
    return true;
}

export async function GET(request, { params }) {
    try {
        const articles = ArticleModel.getAll();
        const article = articles.find(a => a.id == params.id);
        if (!article) return Response.json({ message: 'Article not found' }, { status: 404 });
        return Response.json(article);
    } catch (error) {
        return Response.json({ message: 'Error fetching article', error: error.message }, { status: 500 });
    }
}

export async function PUT(request, { params }) {
    if (!isAdmin(request)) {
        return Response.json({ message: 'Access Denied' }, { status: 403 });
    }
    try {
        const body = await request.json();
        const updatedArticle = ArticleModel.update(params.id, body);
        if (updatedArticle) {
            return Response.json(updatedArticle);
        } else {
            return Response.json({ message: 'Article not found' }, { status: 404 });
        }
    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}

export async function DELETE(request, { params }) {
    if (!isAdmin(request)) {
        return Response.json({ message: 'Access Denied' }, { status: 403 });
    }
    try {
        const success = ArticleModel.delete(params.id);
        if (success) {
            return Response.json({ success: true, message: 'Article deleted successfully' });
        } else {
            return Response.json({ message: 'Article not found' }, { status: 404 });
        }
    } catch (error) {
        return Response.json({ message: 'Error deleting article', error: error.message }, { status: 500 });
    }
}
