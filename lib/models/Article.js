import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'articles.json');

function ensureDataDir() {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

class ArticleModel {
    getAll() {
        ensureDataDir();
        if (!fs.existsSync(DATA_FILE)) return [];
        const data = fs.readFileSync(DATA_FILE);
        return JSON.parse(data);
    }

    saveData(data) {
        ensureDataDir();
        fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
    }

    create(articleData) {
        const articles = this.getAll();
        const newArticle = {
            id: Date.now(),
            date: new Date().toISOString().split('T')[0],
            author: 'צוות Fiesta',
            ...articleData
        };
        articles.push(newArticle);
        this.saveData(articles);
        return newArticle;
    }

    update(id, updatedData) {
        const articles = this.getAll();
        const index = articles.findIndex(a => a.id == id);
        if (index === -1) return null;

        articles[index] = { ...articles[index], ...updatedData, id: parseInt(id) };
        this.saveData(articles);
        return articles[index];
    }

    delete(id) {
        let articles = this.getAll();
        const initialLength = articles.length;
        articles = articles.filter(a => a.id != id);
        this.saveData(articles);
        return initialLength !== articles.length;
    }
}

export default new ArticleModel();
