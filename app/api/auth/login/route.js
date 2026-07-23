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
        const body = await request.json();
        const password = body?.password;
        const email = body?.email;

        if (!password) {
            return NextResponse.json({ message: 'Password required' }, { status: 400 });
        }

        const masterAdmin = getMasterAdminConfig();

        // Master unlock: password alone (fiestamadar) OR email+password
        const passwordMatchesMaster = masterAdmin && password === masterAdmin.password;
        const emailMatchesMaster =
            !email ||
            String(email).toLowerCase().trim() === masterAdmin?.email ||
            String(email).toLowerCase().trim() === 'admin' ||
            String(email).toLowerCase().trim() === 'fiesta';

        if (passwordMatchesMaster && emailMatchesMaster) {
            const adminEmail = masterAdmin.email;
            const token = jwt.sign(
                { id: 'master-admin-' + adminEmail, email: adminEmail, isAdmin: true },
                SECRET_KEY,
                { expiresIn: '7d' }
            );

            const response = NextResponse.json({
                success: true,
                message: 'Login successful',
                token,
                user: { id: 'master-admin', email: adminEmail, name: 'מנהל מערכת', isAdmin: true }
            });

            setAuthCookie(response, token);
            return response;
        }

        if (!email) {
            return NextResponse.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const normalizedEmail = String(email).toLowerCase().trim();

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
            { expiresIn: '7d' }
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
