import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'feedback.json');

function resetStore() {
  if (fs.existsSync(DATA_FILE)) {
    fs.unlinkSync(DATA_FILE);
  }
}

async function loadRoute() {
  // ADMIN_KEY must be set before importing the route module because it throws at import time.
  process.env.ADMIN_KEY = process.env.ADMIN_KEY || 'test-admin-key';
  return import('./route');
}

function postBody(overrides = {}) {
  return {
    name: 'Test User',
    text: 'This is a valid feedback entry.',
    ...overrides,
  };
}

async function callPost(route, body) {
  const request = {
    json: async () => body,
  };
  return route.POST(request);
}

async function callDelete(route, body, adminKey = process.env.ADMIN_KEY) {
  const request = {
    json: async () => body,
    headers: {
      get: (name) => (name === 'authorization' ? `Bearer ${adminKey}` : null),
    },
  };
  return route.DELETE(request);
}

describe('/api/feedback', () => {
  beforeEach(() => {
    resetStore();
  });

  afterEach(() => {
    resetStore();
  });

  it('rejects invalid input with 400', async () => {
    const route = await loadRoute();
    const res = await callPost(route, { name: '', text: '' });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe('Invalid input');
  });

  it('rejects overly long name with 400', async () => {
    const route = await loadRoute();
    const res = await callPost(route, postBody({ name: 'a'.repeat(101) }));
    expect(res.status).toBe(400);
  });

  it('rejects overly long text with 400', async () => {
    const route = await loadRoute();
    const res = await callPost(route, postBody({ text: 'a'.repeat(2001) }));
    expect(res.status).toBe(400);
  });

  it('creates valid feedback with 201', async () => {
    const route = await loadRoute();
    const res = await callPost(route, postBody());
    expect(res.status).toBe(201);
    const body = await res.json();
    expect(body.name).toBe('Test User');
    expect(body.text).toBe('This is a valid feedback entry.');
    expect(body.id).toBeDefined();
    expect(body.createdAt).toBeDefined();
  });

  it('rejects DELETE without valid auth with 403', async () => {
    const route = await loadRoute();
    const res = await callDelete(route, { id: '1' }, 'wrong-key');
    expect(res.status).toBe(403);
  });

  it('rejects DELETE without auth header with 403', async () => {
    const route = await loadRoute();
    const request = {
      json: async () => ({ id: '1' }),
      headers: { get: () => null },
    };
    const res = await route.DELETE(request);
    expect(res.status).toBe(403);
  });

  it('allows DELETE with valid auth', async () => {
    const route = await loadRoute();
    const createRes = await callPost(route, postBody());
    const created = await createRes.json();

    const deleteRes = await callDelete(route, { id: created.id });
    expect(deleteRes.status).toBe(200);
    const body = await deleteRes.json();
    expect(body.success).toBe(true);
  });
});
