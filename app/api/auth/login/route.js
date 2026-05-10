import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        console.log(`Login attempt: email=${email}`);

        // Master Admin Check (hardcoded, doesn't need DB)
        const MASTER_ADMIN_EMAILS = ['fiestaafakot@gmail.com'];
        const MASTER_ADMIN_PASSWORD = 'fiestamadar';

        if (MASTER_ADMIN_EMAILS.includes(email.toLowerCase().trim()) && password === MASTER_ADMIN_PASSWORD) {
            console.log('Master Admin login successful');
            const token = jwt.sign(
                { id: 'master-admin-' + email, email: email, isAdmin: true },
                SECRET_KEY,
                { expiresIn: '24h' }
            );
            return Response.json({
                success: true,
                message: 'Login successful as Master Admin',
                token,
                user: { id: 'master-admin-' + email.split('@')[0], email, name: 'מנהל מערכת', isAdmin: true }
            });
        }

        await dbConnect();
        // Use .select('+password') to explicitly get password since toJSON strips it
        const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');

        if (!user) {
            console.log('Login failed: User not found');
            return Response.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Login failed: Password mismatch');
            return Response.json({ message: 'Invalid credentials' }, { status: 401 });
        }

        console.log('Login successful');

        const token = jwt.sign(
            { id: user._id, email: user.email, isAdmin: user.isAdmin },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        return Response.json({
            success: true,
            message: 'Login successful',
            token,
            user: { id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin }
        });

    } catch (error) {
        return Response.json({ message: 'Error logging in', error: error.message }, { status: 500 });
    }
}
