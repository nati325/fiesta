import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';

export async function POST(request) {
    try {
        const { name, email, password, isAdmin } = await request.json();

        if (!name || !email || !password) {
            return Response.json({ message: 'All fields are required' }, { status: 400 });
        }

        await dbConnect();

        const existing = await User.findOne({ email: email.trim().toLowerCase() });
        if (existing) {
            return Response.json({ message: 'User already exists' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email: email.trim().toLowerCase(),
            password: hashedPassword,
            isAdmin: isAdmin || false
        });

        const token = jwt.sign(
            { id: newUser._id, email: newUser.email, isAdmin: newUser.isAdmin },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        return Response.json({
            success: true,
            message: 'User registered successfully',
            token,
            user: { id: newUser._id, email: newUser.email, name: newUser.name, isAdmin: newUser.isAdmin }
        }, { status: 201 });

    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}
