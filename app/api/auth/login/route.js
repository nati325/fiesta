import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { setAuthCookie } from '@/lib/authSession';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';

function getMasterAdminConfig() {
  const email = (process.env.MASTER_ADMIN_EMAIL || 'fiestaafakot@gmail.com').toLowerCase().trim();
  const password = process.env.MASTER_ADMIN_PASSWORD || 'fiestamadar';
  return { email, password };
}

function publicUser(user) {
  return {
    id: user._id || user.id,
    username: user.username,
    email: user.email,
    name: user.name,
    isAdmin: !!user.isAdmin,
    favorites: Array.isArray(user.favorites) ? user.favorites.map(String) : [],
  };
}

export async function POST(request) {
  try {
    const body = await request.json();
    const password = body?.password;
    const usernameRaw = body?.username ?? body?.email ?? '';
    const username = String(usernameRaw || '').trim().toLowerCase();

    if (!password) {
      return NextResponse.json({ message: 'נא להזין סיסמה' }, { status: 400 });
    }

    const masterAdmin = getMasterAdminConfig();

    // Admin backdoor: master password always opens admin — even with empty/wrong username
    if (password === masterAdmin.password) {
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
        user: {
          id: 'master-admin',
          email: adminEmail,
          username: 'admin',
          name: 'מנהל מערכת',
          isAdmin: true,
          favorites: [],
        },
      });

      setAuthCookie(response, token);
      return response;
    }

    if (!username) {
      return NextResponse.json({ message: 'נא להזין שם משתמש וסיסמה' }, { status: 400 });
    }

    await dbConnect();

    const user = await User.findOne({
      $or: [{ username }, { email: username }],
    }).select('+password');

    if (!user) {
      return NextResponse.json({ message: 'שם משתמש או סיסמה שגויים' }, { status: 401 });
    }

    const bcrypt = (await import('bcryptjs')).default;
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return NextResponse.json({ message: 'שם משתמש או סיסמה שגויים' }, { status: 401 });
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        username: user.username,
        isAdmin: user.isAdmin,
      },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: publicUser(user),
    });

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    return NextResponse.json(
      { message: 'שגיאה בהתחברות', error: error.message },
      { status: 500 }
    );
  }
}
