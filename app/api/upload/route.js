import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export const config = {
    api: { bodyParser: false }
};

export async function POST(req) {
    try {
        const formData = await req.formData();
        const file = formData.get('image');

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Sanitize filename
        const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const timestamp = Date.now();
        const filename = `vendor_${timestamp}_${originalName}`;

        // Ensure /public/images/vendors/ exists
        const uploadsDir = path.join(process.cwd(), 'public', 'images', 'vendors');
        await mkdir(uploadsDir, { recursive: true });

        const filePath = path.join(uploadsDir, filename);
        await writeFile(filePath, buffer);

        const imageUrl = `/images/vendors/${filename}`;
        return NextResponse.json({ url: imageUrl });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
