import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';

function uniqIds(list) {
  return [...new Set((list || []).map((id) => String(id)).filter(Boolean))];
}

async function getUserFromRequest(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (String(decoded.id).startsWith('master-admin-')) {
      return { isMaster: true, favorites: [] };
    }
    await dbConnect();
    const user = await User.findById(decoded.id);
    if (!user) return null;
    return { isMaster: false, user };
  } catch {
    return null;
  }
}

export async function GET(request) {
  const auth = await getUserFromRequest(request);
  if (!auth) {
    return NextResponse.json({ message: 'לא מחובר' }, { status: 401 });
  }
  if (auth.isMaster) {
    return NextResponse.json({ favorites: [] });
  }
  return NextResponse.json({ favorites: uniqIds(auth.user.favorites) });
}

export async function PUT(request) {
  const auth = await getUserFromRequest(request);
  if (!auth) {
    return NextResponse.json({ message: 'לא מחובר' }, { status: 401 });
  }
  if (auth.isMaster) {
    return NextResponse.json({ favorites: [] });
  }

  try {
    const body = await request.json();
    const mode = body?.mode || 'replace';
    const incoming = uniqIds(body?.favorites);

    let next;
    if (mode === 'merge') {
      next = uniqIds([...(auth.user.favorites || []), ...incoming]);
    } else {
      next = incoming;
    }

    auth.user.favorites = next;
    await auth.user.save();

    return NextResponse.json({ favorites: next });
  } catch (error) {
    return NextResponse.json(
      { message: 'שגיאה בעדכון מועדפים', error: error.message },
      { status: 500 }
    );
  }
}
