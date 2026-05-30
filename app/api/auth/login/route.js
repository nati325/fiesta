import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { setAuthCookie } from '@/lib/authSession';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';

function getMasterAdminConfig() {
    const email = process.env.MASTER_ADMIN_EMAIL?.toLowerCase().trim();
    const password = process.env.MASTER_ADMIN_PASSWORD;
    if (!email || !password) return null;
    return { email, password };
}

export async function POST(request) {
    try {
        const { email, password } = await request.json();

        if (!email || !password) {
            return NextResponse.json({ message: 'Email and password required' }, { status: 400 });
        }

        const normalizedEmail = email.toLowerCase().trim();
        const masterAdmin = getMasterAdminConfig();

        if (masterAdmin && normalizedEmail === masterAdmin.email && password === masterAdmin.password) {
            const token = jwt.sign(
                { id: 'master-admin-' + normalizedEmail, email: normalizedEmail, isAdmin: true },
                SECRET_KEY,
                { expiresIn: '24h' }
            );

            const response = NextResponse.json({
                success: true,
                message: 'Login successful',
                token,
                user: { id: 'master-admin', email: normalizedEmail, name: 'מנהל מערכת', isAdmin: true }
            });

            setAuthCookie(response, token);
            return response;
        }

        await dbConnect();
        const user = await User.findOne({ email: normalizedEmail }).select('+password');

        if (!user) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const bcrypt = (await import('bcryptjs')).default;
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        const response = NextResponse.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin }
        });

        setAuthCookie(response, token);
        return response;

    } catch (error) {
        return NextResponse.json({ message: 'Error logging in', error: error.message }, { status: 500 });
    }
}
