const request = require('supertest');

// Mock firebase-admin before requiring app
jest.mock('firebase-admin', () => {
  const auth = {
    verifyIdToken: jest.fn(),
    verifySessionCookie: jest.fn(),
    getUser: jest.fn()
  };

  const dbRefMap = new Map();
  const database = () => ({
    ref: (path) => ({
      get: async () => {
        const val = dbRefMap.get(path);
        if (!val) return { exists: () => false };
        return { exists: () => true, val: () => val };
      },
      once: async (event) => {
        const val = dbRefMap.get(path);
        if (!val) return { exists: () => false };
        return { exists: () => true, val: () => val };
      },
      update: async (partial) => {
        const existing = dbRefMap.get(path) || {};
        const updated = { ...existing, ...partial };
        dbRefMap.set(path, updated);
        return updated;
      },
      set: async (val) => {
        dbRefMap.set(path, val);
        return val;
      },
      remove: async () => {
        dbRefMap.delete(path);
        return null;
      },
      push: () => {
        const key = `random-${Math.random().toString(36).slice(2,8)}`;
        return {
          key,
          set: (val) => dbRefMap.set(`${path}/${key}`, val),
        };
      }
    })
  });

  const admin = {
    auth: () => auth,
    database,
    initializeApp: jest.fn(),
    credential: { cert: jest.fn() },
    __helpers: { auth, dbRefMap }
  };
  return admin;
});

const admin = require('firebase-admin');
const app = require('../src/app');

describe('Middleware integration tests', () => {
  beforeEach(() => {
    admin.__helpers.auth.verifyIdToken.mockReset();
    admin.__helpers.auth.verifySessionCookie.mockReset();
    admin.__helpers.auth.getUser.mockReset();
    admin.__helpers.dbRefMap.clear();
  });

  test('verifyAdmin: should return 401 if no token', async () => {
    const res = await request(app).get('/api/roles/permissions-structure');
    expect(res.status).toBe(401);
  });

  test('verifyAdmin: should return 403 for non-admin token', async () => {
    admin.__helpers.auth.verifyIdToken.mockResolvedValue({ uid: 'user1', admin: false });
    const res = await request(app).get('/api/roles/permissions-structure').set('Authorization', 'Bearer token');
    expect(res.status).toBe(403);
  });

  test('verifyAdmin: should allow admin token', async () => {
    admin.__helpers.auth.verifyIdToken.mockResolvedValue({ uid: 'admin1', email: 'a@b.com', admin: true });
    const res = await request(app).get('/api/roles/permissions-structure').set('Authorization', 'Bearer token');
    expect(res.status).toBe(200);
  });

  test('verifyOwner: should return 403 if not owner', async () => {
    admin.__helpers.auth.verifyIdToken.mockResolvedValue({ uid: 'user2', admin: false, role: 'owner' });
    admin.__helpers.dbRefMap.set('users/user2/restaurants/restaurant1', null);

    const res = await request(app).put('/api/restaurants/restaurant1').set('Authorization', 'Bearer token').send({ name: 'Updated' });
    expect([403, 401]).toContain(res.status); // 403 if not owner, 401 if token wasn't accepted
  });

  test('verifyOwner: should allow owner', async () => {
    admin.__helpers.auth.verifyIdToken.mockResolvedValue({ uid: 'owner1', admin: false, role: 'owner' });
    admin.__helpers.dbRefMap.set('users/owner1/restaurants/restaurant2', { role: 'owner' });
    const res = await request(app).put('/api/restaurants/restaurant2').set('Authorization', 'Bearer token').send({ name: 'Updated' });
    expect(res.status).toBe(200);
  });

  test('verifyPermission: items route - deny staff without permission', async () => {
    admin.__helpers.auth.verifyIdToken.mockResolvedValue({ uid: 'staff1', admin: false, role: 'staff' });
    admin.__helpers.dbRefMap.set('restaurants/rest1/staff/staff1', { roleId: 'roleX' });
    admin.__helpers.dbRefMap.set('restaurants/rest1/roles/roleX', { permissions: { items: { read: false } } });

    const res = await request(app).get('/api/restaurants/rest1/items').set('Authorization', 'Bearer token');
    expect([403, 401]).toContain(res.status);
  });

  test('verifyPermission: items route - allow staff with permission', async () => {
    admin.__helpers.auth.verifyIdToken.mockResolvedValue({ uid: 'staff2', admin: false, role: 'staff' });
    admin.__helpers.dbRefMap.set('restaurants/rest1/staff/staff2', { roleId: 'roleY' });
    admin.__helpers.dbRefMap.set('restaurants/rest1/roles/roleY', { permissions: { items: { read: true } } });

    const res = await request(app).get('/api/restaurants/rest1/items').set('Authorization', 'Bearer token');
    expect(res.status).not.toBe(403);
  });
});
