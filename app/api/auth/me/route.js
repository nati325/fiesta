import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';
import jwt from 'jsonwebtoken';
import { getTokenFromRequest } from '@/lib/authSession';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';

export async function GET(request) {
    const token = getTokenFromRequest(request);
    if (!token) {
        return Response.json({ authenticated: false }, { status: 401 });
    }

    try {
        const decoded = jwt.verify(token, SECRET_KEY);

        if (String(decoded.id).startsWith('master-admin-')) {
            return Response.json({
                authenticated: true,
                user: {
                    id: decoded.id,
                    email: decoded.email,
                    username: 'admin',
                    name: 'מנהל מערכת',
                    isAdmin: true,
                    favorites: [],
                    eventJourney: null,
                }
            });
        }

        await dbConnect();
        const user = await User.findById(decoded.id);
        if (!user) {
            return Response.json({ authenticated: false }, { status: 401 });
        }

        return Response.json({
            authenticated: true,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                name: user.name,
                isAdmin: user.isAdmin,
                favorites: Array.isArray(user.favorites) ? user.favorites.map(String) : [],
                eventJourney: user.eventJourney || null,
            }
        });
    } catch {
        return Response.json({ authenticated: false }, { status: 401 });
    }
}
