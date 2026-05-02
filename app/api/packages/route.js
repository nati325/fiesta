import { NextResponse } from 'next/server';
import { readFile, writeFile } from 'fs/promises';
import path from 'path';

const filePath = path.join(process.cwd(), 'data', 'packages.json');

async function readPackages() {
    try {
        const data = await readFile(filePath, 'utf-8');
        return JSON.parse(data);
    } catch {
        return [];
    }
}

async function writePackages(packages) {
    await writeFile(filePath, JSON.stringify(packages, null, 2));
}

export async function GET() {
    const packages = await readPackages();
    return NextResponse.json(packages);
}

export async function POST(req) {
    const body = await req.json();
    const packages = await readPackages();
    const newPackage = {
        id: Date.now(),
        createdAt: new Date().toISOString(),
        active: true,
        ...body
    };
    packages.push(newPackage);
    await writePackages(packages);
    return NextResponse.json(newPackage, { status: 201 });
}
