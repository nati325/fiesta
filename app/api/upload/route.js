import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import { isAdminRequest, adminDeniedResponse } from '@/lib/adminAuth';
import { isCloudinaryConfigured, uploadBufferToCloudinary } from '@/lib/cloudinaryUpload';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const MAX_FILE_SIZE = 15 * 1024 * 1024; // 15MB
const ALLOWED_EXTENSIONS = new Set([
    'jpg', 'jpeg', 'png', 'webp', 'gif', 'heic', 'heif',
    'pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx',
    'mp4', 'mov', 'webm',
]);

const MIME_TO_EXT = {
    'image/jpeg': 'jpg',
    'image/jpg': 'jpg',
    'image/pjpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/heic': 'heic',
    'image/heif': 'heic',
    'application/pdf': 'pdf',
    'video/mp4': 'mp4',
    'video/quicktime': 'mov',
    'video/webm': 'webm',
};

function resolveExtension(file) {
    const fromName = (file.name?.split('.').pop() || '').toLowerCase();
    if (fromName && ALLOWED_EXTENSIONS.has(fromName)) return fromName;
    const fromMime = MIME_TO_EXT[file.type];
    if (fromMime) return fromMime;
    return fromName;
}

export async function POST(req) {
    if (!isAdminRequest(req)) {
        return adminDeniedResponse();
    }

    try {
        const formData = await req.formData();
        const file = formData.get('image') || formData.get('file');
        const uploadType = formData.get('type') || 'image';

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'לא נבחר קובץ' }, { status: 400 });
        }

        if (file.size > MAX_FILE_SIZE) {
            return NextResponse.json({ error: 'הקובץ גדול מדי (מקסימום 15MB)' }, { status: 400 });
        }

        const ext = resolveExtension(file);
        if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
            return NextResponse.json(
                { error: 'סוג קובץ לא נתמך. נסו JPG או PNG מהגלריה' },
                { status: 400 }
            );
        }

        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        const isDocument = uploadType === 'document';
        const originalName = file.name?.includes('.')
            ? file.name
            : `upload.${ext}`;

        if (isCloudinaryConfigured()) {
            const folder = isDocument ? 'fiesta-agreements' : 'fiesta-vendors';
            const uploaded = await uploadBufferToCloudinary(buffer, {
                originalName,
                uploadType,
                folder,
            });
            return NextResponse.json({ url: uploaded.url, fileName: uploaded.fileName });
        }

        // Local/dev fallback only — Vercel filesystem is read-only
        if (process.env.VERCEL) {
            return NextResponse.json(
                { error: 'העלאת תמונות לא מוגדרת בשרת (Cloudinary חסר)' },
                { status: 503 }
            );
        }

        const safeOriginal = originalName.replace(/[^a-zA-Z0-9._-]/g, '_');
        const timestamp = Date.now();
        const filename = `${isDocument ? 'agreement' : 'vendor'}_${timestamp}_${safeOriginal}`;

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

        return NextResponse.json({ url: fileUrl, fileName: file.name || originalName });
    } catch (error) {
        console.error('Upload error:', error);
        const detail = error?.message || 'Upload failed';
        return NextResponse.json(
            { error: `העלאה נכשלה: ${detail}` },
            { status: 500 }
        );
    }
}
