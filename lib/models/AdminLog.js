import fs from 'fs';
import path from 'path';

const LOG_FILE = path.join(process.cwd(), 'data', 'adminlog.json');

function ensureDataDir() {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

class AdminLog {
    static log(action, entity, entityId, details = {}) {
        const logs = AdminLog.getAll();
        const entry = {
            timestamp: new Date().toISOString(),
            action,
            entity,
            entityId,
            details
        };
        logs.push(entry);
        ensureDataDir();
        fs.writeFileSync(LOG_FILE, JSON.stringify(logs, null, 2));
    }
    static getAll() {
        ensureDataDir();
        if (!fs.existsSync(LOG_FILE)) return [];
        const data = fs.readFileSync(LOG_FILE);
        return JSON.parse(data);
    }
}

export default AdminLog;
