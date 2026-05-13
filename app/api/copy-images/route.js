import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
    try {
        const destDir = path.join(process.cwd(), 'public', 'invitation-templates');
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        } else {
            // Optional: Clear only missing-photo-* files to avoid deleting tpl-* and new-tpl-*
            const destFiles = fs.readdirSync(destDir);
            destFiles.forEach(f => {
                if (f.startsWith('missing-photo-')) {
                    fs.unlinkSync(path.join(destDir, f));
                }
            });
        }
        
        const srcDir = 'c:\\Users\\123\\Desktop\\Fiesta\\missing_photos';
        const files = fs.readdirSync(srcDir).filter(f => !f.startsWith('WhatsApp Image 2026-05-07'));
        
        // Add specific file from workspace if exists
        const extraFile = path.join(process.cwd(), 'WhatsApp Image 2026-05-10 at 16.14.24.jpeg');
        
        const copied = [];
        files.forEach((f, i) => {
            const src = path.join(srcDir, f);
            const ext = path.extname(f);
            const newName = `missing-photo-${i+1}${ext}`;
            const dest = path.join(destDir, newName);
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
                copied.push(newName);
            }
        });

        // Copy the extra one if it exists
        if (fs.existsSync(extraFile)) {
            const nextIndex = copied.length + 1;
            const ext = path.extname(extraFile);
            const newName = `missing-photo-${nextIndex}${ext}`;
            const dest = path.join(destDir, newName);
            fs.copyFileSync(extraFile, dest);
            copied.push(newName);
        }
        
        return NextResponse.json({ success: true, count: copied.length, copied });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
