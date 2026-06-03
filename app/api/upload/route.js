import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { isAdminRequest, adminDeniedResponse } from '@/lib/adminAuth';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '@/lib/cloudinaryUpload';

export const dynamic = 'force-dynamic';

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTENSIONS = new Set([
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'heic',
    'pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx',
    'mp4', 'mov', 'webm',
]);

export async function POST(req) {
    if (!isAdminRequest(req)) {
        return adminDeniedResponse();
    }

    try {
        const formData = await req.formData();
        const file = formData.get('image') || formData.get('file');
        const uploadType = formData.get('type') || 'image';

        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'File too large (max 15MB)' }, { status: 400 });
        }

        const ext = (file.name.split('.').pop() || '').toLowerCase();
        if (!ALLOWED_EXTENSIONS.has(ext)) {
            return NextResponse.json({ error: 'File type not allowed' }, { status: 400 });
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const isDocument = uploadType === 'document';

        if (isCloudinaryConfigured()) {
            const folder = isDocument ? 'fiesta-agreements' : 'fiesta-vendors';
            const uploaded = await uploadBufferToCloudinary(buffer, {
                originalName: file.name,
                uploadType,
                folder,
            });
            return NextResponse.json({ url: uploaded.url, fileName: uploaded.fileName });
        }

        const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
        const timestamp = Date.now();
        const filename = `${isDocument ? 'agreement' : 'vendor'}_${timestamp}_${originalName}`;

        const uploadsDir = path.join(
            process.cwd(),
            'public',
            isDocument ? 'documents' : 'images',
            isDocument ? 'agreements' : 'vendors'
        );
        await mkdir(uploadsDir, { recursive: true });

        const filePath = path.join(uploadsDir, filename);
        await writeFile(filePath, buffer);

        const fileUrl = isDocument
            ? `/documents/agreements/${filename}`
            : `/images/vendors/${filename}`;

        return NextResponse.json({ url: fileUrl, fileName: file.name });
    } catch (error) {
        console.error('Upload error:', error);
        return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
    }
}
