import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/mongodb';
import { isAdminRequest, adminDeniedResponse } from '@/lib/adminAuth';
import { putImage, contentTypeFromName, MAX_IMAGE_BYTES } from '@/lib/imageStore';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

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

        if (!file || typeof file === 'string') {
            return NextResponse.json({ error: 'לא נבחר קובץ' }, { status: 400 });
        }

        if (file.size > MAX_IMAGE_BYTES) {
            return NextResponse.json(
                { error: `הקובץ גדול מדי (מקסימום ${MAX_IMAGE_BYTES / 1048576}MB)` },
                { status: 400 }
            );
        }

        const ext = resolveExtension(file);
        if (!ext || !ALLOWED_EXTENSIONS.has(ext)) {
            return NextResponse.json(
                { error: 'סוג קובץ לא נתמך. נסו JPG או PNG מהגלריה' },
                { status: 400 }
            );
        }

        const buffer = Buffer.from(await file.arrayBuffer());
        const originalName = file.name?.includes('.') ? file.name : `upload.${ext}`;

        await dbConnect();
        const stored = await putImage(mongoose.connection.db, buffer, {
            contentType: file.type || contentTypeFromName(originalName),
            fileName: originalName,
        });

        return NextResponse.json({ url: stored.url, fileName: file.name || originalName });
    } catch (error) {
        console.error('Upload error:', error);
        const detail = error?.message || 'Upload failed';
        return NextResponse.json(
            { error: `העלאה נכשלה: ${detail}` },
            { status: 500 }
        );
    }
}
