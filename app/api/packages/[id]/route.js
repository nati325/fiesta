import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'packages.json');

async function readPackages() {
    try {
        const data = await readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch { return []; }
}
async function writePackages(packages) {
    await writeFile(filePath, JSON.stringify(packages, null, 2));
}

export async function PUT(req, { params }) {
    const id = Number(params.id);
    const body = await req.json();
    const packages = await readPackages();
    const idx = packages.findIndex(p => p.id === id);
    if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    packages[idx] = { ...packages[idx], ...body };
    await writePackages(packages);
    return NextResponse.json(packages[idx]);
}

export async function DELETE(req, { params }) {
    const id = Number(params.id);
    const packages = await readPackages();
    const filtered = packages.filter(p => p.id !== id);
    await writePackages(filtered);
    return NextResponse.json({ ok: true });
}
