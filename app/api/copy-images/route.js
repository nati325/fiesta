import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';

export async function GET() {
    try {
        const destDir = path.join(process.cwd(), 'public', 'invitation-templates');
        if (!fs.existsSync(destDir)) {
            fs.mkdirSync(destDir, { recursive: true });
        }
        
        const files = [
            "WhatsApp Image 2026-05-10 at 02.18.13.jpeg",
            "WhatsApp Image 2026-05-10 at 02.18.59.jpeg",
            "WhatsApp Image 2026-05-10 at 02.20.00.jpeg",
            "WhatsApp Image 2026-05-10 at 11.57.22.jpeg",
            "WhatsApp Image 2026-05-10 at 11.57.25.jpeg",
            "WhatsApp Image 2026-05-10 at 11.57.30.jpeg"
        ];
        
        const srcDir = 'c:\\Users\\123\\Desktop\\Fiesta';
        
        files.forEach((f, i) => {
            const src = path.join(srcDir, f);
            const dest = path.join(destDir, `new-tpl-${i+1}.jpeg`);
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
            }
        });
        
        return NextResponse.json({ success: true });
    } catch (e) {
        return NextResponse.json({ error: e.message }, { status: 500 });
    }
}
