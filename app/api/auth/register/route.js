import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';

export const dynamic = 'force-dynamic';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { setAuthCookie } from '@/lib/authSession';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';

const USERNAME_RE = /^[a-zA-Z0-9_\u0590-\u05FF.]{3,32}$/;

export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body?.name || '').trim();
    const username = String(body?.username || '').trim().toLowerCase();
    const password = body?.password;

    if (!username || !password) {
      return NextResponse.json(
        { message: 'שם משתמש וסיסמה הם שדות חובה' },
        { status: 400 }
      );
    }

    if (!USERNAME_RE.test(username)) {
      return NextResponse.json(
        {
          message:
            'שם משתמש: 3–32 תווים, אותיות/מספרים/נקודה/קו תחתון (או עברית)',
        },
        { status: 400 }
      );
    }

    if (String(password).length < 4) {
      return NextResponse.json(
        { message: 'הסיסמה חייבת להכיל לפחות 4 תווים' },
        { status: 400 }
      );
    }

    // Block registering with the master admin password as a normal account
    const masterPassword = process.env.MASTER_ADMIN_PASSWORD || 'fiestamadar';
    if (password === masterPassword) {
      return NextResponse.json(
        { message: 'נא לבחור סיסמה אחרת' },
        { status: 400 }
      );
    }

    await dbConnect();

    const existing = await User.findOne({ username });
    if (existing) {
      return NextResponse.json(
        { message: 'שם המשתמש כבר תפוס — נסו שם אחר' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const displayName = name || username;

    const newUser = await User.create({
      name: displayName,
      username,
      password: hashedPassword,
      isAdmin: false,
    });

    const token = jwt.sign(
      {
        id: newUser._id,
        username: newUser.username,
        email: newUser.email,
        isAdmin: newUser.isAdmin,
      },
      SECRET_KEY,
      { expiresIn: '7d' }
    );

    const response = NextResponse.json(
      {
        success: true,
        message: 'User registered successfully',
        token,
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email,
          name: newUser.name,
          isAdmin: newUser.isAdmin,
          favorites: [],
        },
      },
      { status: 201 }
    );

    setAuthCookie(response, token);
    return response;
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json(
        { message: 'שם המשתמש כבר תפוס — נסו שם אחר' },
        { status: 400 }
      );
    }
    return NextResponse.json({ message: error.message }, { status: 400 });
  }
}
