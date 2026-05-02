import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'users.json');

function ensureDataDir() {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

class UserModel {
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

    create(userData) {
        const users = this.getAll();

        if (users.find(u => u.email === userData.email)) {
            throw new Error('User already exists');
        }

        const newUser = {
            id: Date.now(),
            isAdmin: false,
            createdAt: new Date().toISOString(),
            ...userData
        };

        users.push(newUser);
        this.saveData(users);
        return newUser;
    }

    findByEmail(email) {
        const users = this.getAll();
        return users.find(u => u.email === email);
    }

    findById(id) {
        const users = this.getAll();
        return users.find(u => u.id === id);
    }
}

export default new UserModel();
