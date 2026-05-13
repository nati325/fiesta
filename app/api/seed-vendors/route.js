import dbConnect from '@/lib/mongodb';
import Vendor from '@/lib/models/Vendor';
import fs from 'fs';
import path from 'path';

export async function GET(request) {
    try {
        await dbConnect();
        
        // Read JSON file
        const filePath = path.join(process.cwd(), 'data', 'vendors.json');
        const fileContents = fs.readFileSync(filePath, 'utf8');
        const vendorsData = JSON.parse(fileContents);
        
        // Clear existing vendors
        await Vendor.deleteMany({});
        
        // Clean the ID fields (MongoDB uses _id, but we have string/number ids in JSON)
        // Mongoose might try to map 'id' to something else, or keep it. It's fine to keep it as an additional field.
        const cleanedData = vendorsData.map(v => {
            const newV = { ...v };
            if (newV.id) {
                // If it's a number, save it, or ignore. Mongoose allows extra fields if strict is false,
                // but let's be safe. Our schema doesn't have an explicit 'id' field, but it has '_id'.
                // Mongoose transforms don't restrict inputs unless specified.
                delete newV.id; 
            }
            return newV;
        });

        // Insert new vendors
        const result = await Vendor.insertMany(cleanedData);
        
        return Response.json({ message: 'Seeded successfully', count: result.length });
    } catch (error) {
        return Response.json({ message: 'Error seeding', error: error.message }, { status: 500 });
    }
}
