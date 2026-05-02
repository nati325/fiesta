import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'customers.json');

function ensureDataDir() {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

class CustomerModel {
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

    create(customerData) {
        const customers = this.getAll();
        const newCustomer = {
            id: Date.now(),
            name: customerData.name,
            phone: customerData.phone,
            status: customerData.status
        };
        customers.push(newCustomer);
        this.saveData(customers);
        return newCustomer;
    }

    update(id, updatedData) {
        let customers = this.getAll();
        const index = customers.findIndex(c => c.id == id);
        if (index === -1) return null;
        customers[index] = { ...customers[index], ...updatedData, id: parseInt(id) };
        this.saveData(customers);
        return customers[index];
    }

    delete(id) {
        let customers = this.getAll();
        const initialLength = customers.length;
        customers = customers.filter(c => c.id != id);
        this.saveData(customers);
        return initialLength !== customers.length;
    }
}

export default new CustomerModel();
