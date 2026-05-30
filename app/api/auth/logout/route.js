import { NextResponse } from 'next/server';
import { clearAuthCookie } from '@/lib/authSession';

export async function POST() {
    const response = NextResponse.json({ success: true });
    clearAuthCookie(response);
    return response;
}
