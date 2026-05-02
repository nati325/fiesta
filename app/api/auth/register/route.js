import UserModel from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';

export async function POST(request) {
    try {
        const { name, email, password, isAdmin } = await request.json();

        if (!name || !email || !password) {
            return Response.json({ message: 'All fields are required' }, { status: 400 });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = UserModel.create({
            name,
            email,
            password: hashedPassword,
            isAdmin: isAdmin || false
        });

        const { password: _, ...userWithoutPassword } = newUser;

        return Response.json({
            success: true,
            message: 'User registered successfully',
            user: userWithoutPassword
        }, { status: 201 });

    } catch (error) {
        return Response.json({ message: error.message }, { status: 400 });
    }
}
