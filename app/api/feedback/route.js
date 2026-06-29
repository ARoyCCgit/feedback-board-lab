import { NextResponse } from 'next/server';
import { readAll, writeAll } from '../../../lib/store';
import { feedbackSchema } from '../../../lib/validation';

// FLAW #1 FIX: Read admin key from environment; throw if missing rather than failing silently.
const ADMIN_KEY = process.env.ADMIN_KEY;
if (!ADMIN_KEY) {
  throw new Error('ADMIN_KEY environment variable is required but was not set.');
}

export async function GET() {
  const items = readAll();
  return NextResponse.json(items);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  // FLAW #2 FIX: Validate input with zod; reject invalid requests with 400.
  const parsed = feedbackSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid input', details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const items = readAll();
  const newItem = {
    id: Date.now().toString(),
    name: parsed.data.name,
    text: parsed.data.text,
    createdAt: new Date().toISOString(),
  };
  items.push(newItem);

  // FLAW #5 FIX: Log the error and return a proper 500 response on write failure.
  try {
    writeAll(items);
  } catch (e) {
    console.error('Failed to persist feedback:', e);
    return NextResponse.json({ error: 'Failed to save feedback' }, { status: 500 });
  }

  return NextResponse.json(newItem, { status: 201 });
}

export async function DELETE(request) {
  // FLAW #4 FIX: Enforce auth server-side via Authorization header against process.env.ADMIN_KEY.
  const authHeader = request.headers.get('authorization');
  if (!authHeader || authHeader !== `Bearer ${ADMIN_KEY}`) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  let body;
  try {
    body = await request.json();
  } catch (e) {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const items = readAll();
  const updated = items.filter((item) => item.id !== body.id);

  // FLAW #5 FIX: Log the error and return a proper 500 response on write failure.
  try {
    writeAll(updated);
  } catch (e) {
    console.error('Failed to persist feedback deletion:', e);
    return NextResponse.json({ error: 'Failed to delete feedback' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
