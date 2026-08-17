import dbConnect from '@/lib/mongodb';
import User from '@/lib/models/User';
import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { getTokenFromRequest } from '@/lib/authSession';

export const dynamic = 'force-dynamic';

const SECRET_KEY = process.env.JWT_SECRET || 'fiesta-secret-admin-key-2025';

function uniqueIds(values) {
  return [...new Set((values || []).map((value) => String(value || '').trim()).filter(Boolean))];
}

function cleanJourney(value = {}) {
  return {
    eventType: String(value.eventType || '').trim(),
    date: String(value.date || '').trim(),
    region: String(value.region || '').trim(),
    guests: String(value.guests || '').replace(/[^\d]/g, ''),
    budget: String(value.budget || '').replace(/[^\d]/g, ''),
    completedCategories: uniqueIds(value.completedCategories),
    cart: uniqueIds(value.cart),
    onboardingComplete: Boolean(value.onboardingComplete),
    lastCategory: String(value.lastCategory || '').trim(),
    lastVisitedAt: value.lastVisitedAt ? new Date(value.lastVisitedAt) : null,
  };
}

async function authenticatedUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    if (String(decoded.id).startsWith('master-admin-')) return { isMaster: true };
    await dbConnect();
    const user = await User.findById(decoded.id);
    return user ? { user, isMaster: false } : null;
  } catch {
    return null;
  }
}

export async function GET(request) {
  const auth = await authenticatedUser(request);
  if (!auth) return NextResponse.json({ message: 'לא מחובר' }, { status: 401 });
  if (auth.isMaster) return NextResponse.json({ journey: cleanJourney() });
  return NextResponse.json({ journey: cleanJourney(auth.user.eventJourney) });
}

export async function PUT(request) {
  const auth = await authenticatedUser(request);
  if (!auth) return NextResponse.json({ message: 'לא מחובר' }, { status: 401 });
  if (auth.isMaster) return NextResponse.json({ journey: cleanJourney() });

  try {
    const raw = await request.json();
    const incoming = cleanJourney(raw);
    const mode = new URL(request.url).searchParams.get('mode') || 'replace';
    const existing = cleanJourney(auth.user.eventJourney);
    const journey = mode === 'patch'
      ? {
        ...existing,
        ...(Object.prototype.hasOwnProperty.call(raw, 'eventType') ? { eventType: incoming.eventType } : {}),
        ...(Object.prototype.hasOwnProperty.call(raw, 'date') ? { date: incoming.date } : {}),
        ...(Object.prototype.hasOwnProperty.call(raw, 'region') ? { region: incoming.region } : {}),
        ...(Object.prototype.hasOwnProperty.call(raw, 'guests') ? { guests: incoming.guests } : {}),
        ...(Object.prototype.hasOwnProperty.call(raw, 'budget') ? { budget: incoming.budget } : {}),
        ...(Object.prototype.hasOwnProperty.call(raw, 'completedCategories') ? { completedCategories: incoming.completedCategories } : {}),
        ...(Object.prototype.hasOwnProperty.call(raw, 'cart') ? { cart: incoming.cart } : {}),
        ...(Object.prototype.hasOwnProperty.call(raw, 'onboardingComplete') ? { onboardingComplete: incoming.onboardingComplete } : {}),
        ...(Object.prototype.hasOwnProperty.call(raw, 'lastCategory') ? { lastCategory: incoming.lastCategory } : {}),
        ...(Object.prototype.hasOwnProperty.call(raw, 'lastVisitedAt') ? { lastVisitedAt: incoming.lastVisitedAt } : {}),
      }
      : mode === 'merge'
      ? {
        ...existing,
        ...incoming,
        eventType: incoming.eventType || existing.eventType,
        date: incoming.date || existing.date,
        region: incoming.region || existing.region,
        guests: incoming.guests || existing.guests,
        budget: incoming.budget || existing.budget,
        completedCategories: uniqueIds([...existing.completedCategories, ...incoming.completedCategories]),
        cart: uniqueIds([...existing.cart, ...incoming.cart]),
        onboardingComplete: existing.onboardingComplete || incoming.onboardingComplete,
        lastCategory: incoming.lastCategory || existing.lastCategory,
        lastVisitedAt: incoming.lastVisitedAt || existing.lastVisitedAt,
      }
      : incoming;

    auth.user.eventJourney = journey;
    await auth.user.save();
    return NextResponse.json({ journey: cleanJourney(auth.user.eventJourney) });
  } catch (error) {
    return NextResponse.json(
      { message: 'שגיאה בשמירת מסע האירוע', error: error.message },
      { status: 500 },
    );
  }
}
