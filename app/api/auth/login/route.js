import UserModel from '@/lib/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';

export async function POST(request) {
    try {
        const { email, password } = await request.json();
        console.log(`Login attempt: email=${email}`);

        const user = UserModel.getAll().find(u => u.email.toLowerCase() === email.trim().toLowerCase());

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
            { id: user.id, email: user.email, isAdmin: user.isAdmin },
            SECRET_KEY,
            { expiresIn: '24h' }
        );

        const { password: _, ...userWithoutPassword } = user;

        return Response.json({
            success: true,
            message: 'Login successful',
            token,
            user: userWithoutPassword
        });

    } catch (error) {
        return Response.json({ message: 'Error logging in', error: error.message }, { status: 500 });
    }
}
