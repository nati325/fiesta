import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'vendors.json');

function ensureDataDir() {
    const dir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

class VendorModel {
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

    create(vendorData) {
        const vendors = this.getAll();
        const newVendor = {
            id: Date.now(),
            name: vendorData.name,
            type: vendorData.type,
            contact: vendorData.contact,
            description: vendorData.description,
            image: vendorData.image,
            region: vendorData.region || 'מרכז',
            price: vendorData.price || '',
            discount: vendorData.discount || '',
            agreementSigned: !!vendorData.agreementSigned
        };
        vendors.push(newVendor);
        this.saveData(vendors);
        return newVendor;
    }

    update(id, updatedData) {
        let vendors = this.getAll();
        const index = vendors.findIndex(v => v.id == id);
        if (index === -1) return null;
        vendors[index] = {
            ...vendors[index],
            ...updatedData,
            id: parseInt(id),
            region: updatedData.region || vendors[index].region || 'מרכז',
            price: updatedData.price || vendors[index].price || '',
            discount: updatedData.discount || vendors[index].discount || '',
            agreementSigned: typeof updatedData.agreementSigned === 'boolean' ? updatedData.agreementSigned : (vendors[index].agreementSigned || false)
        };
        this.saveData(vendors);
        return vendors[index];
    }

    delete(id) {
        let vendors = this.getAll();
        const initialLength = vendors.length;
        vendors = vendors.filter(v => v.id != id);
        this.saveData(vendors);
        return initialLength !== vendors.length;
    }

    findByType(type) {
        const vendors = this.getAll();
        return vendors.filter(v => v.type === type);
    }
}

export default new VendorModel();
