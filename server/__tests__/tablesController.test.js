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
        const key = `tbl_${Math.random().toString(36).slice(2,8)}`;
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

describe('Tables Controller concurrency + permission tests', () => {
  const restId = 'rest1';

  beforeEach(() => {
    admin.__helpers.auth.verifyIdToken.mockReset();
    admin.__helpers.dbRefMap.clear();
    // default to admin token
    admin.__helpers.auth.verifyIdToken.mockResolvedValue({ uid: 'admin', admin: true });
  });

  test('permission: deny staff without pos read permission', async () => {
    admin.__helpers.auth.verifyIdToken.mockResolvedValue({ uid: 'staff1', admin: false, role: 'staff' });
    // staff membership exists with roleX that lacks pos.read
    admin.__helpers.dbRefMap.set(`restaurants/${restId}/staff/staff1`, { roleId: 'roleX' });
    admin.__helpers.dbRefMap.set(`restaurants/${restId}/roles/roleX`, { permissions: { pos: { read: false } } });

    const res = await request(app).get(`/api/restaurants/${restId}/tables`).set('Authorization', 'Bearer token');
    expect([401, 403]).toContain(res.status);
  });

  test('permission: allow staff with pos read permission', async () => {
    admin.__helpers.auth.verifyIdToken.mockResolvedValue({ uid: 'staff2', admin: false, role: 'staff' });
    admin.__helpers.dbRefMap.set(`restaurants/${restId}/staff/staff2`, { roleId: 'roleY' });
    admin.__helpers.dbRefMap.set(`restaurants/${restId}/roles/roleY`, { permissions: { pos: { read: true } } });
    const res = await request(app).get(`/api/restaurants/${restId}/tables`).set('Authorization', 'Bearer token');
    expect(res.status).not.toBe(403);
  });

  test('permission: deny update without pos.update', async () => {
    // create table as admin
    const createRes = await request(app).post(`/api/restaurants/${restId}/tables`).set('Authorization', 'Bearer token').send({ name: 'P1', items: [] });
    expect(createRes.status).toBe(201);
    const t = createRes.body;
    // mock staff without pos.update
    admin.__helpers.auth.verifyIdToken.mockResolvedValue({ uid: 'staff3', admin: false, role: 'staff' });
    admin.__helpers.dbRefMap.set(`restaurants/${restId}/staff/staff3`, { roleId: 'roleNoUpdate' });
    admin.__helpers.dbRefMap.set(`restaurants/${restId}/roles/roleNoUpdate`, { permissions: { pos: { read: true, update: false } } });
    const res = await request(app).put(`/api/restaurants/${restId}/tables/${t.id}`).set('Authorization', 'Bearer token').send({ name: 'New' });
    expect([401, 403]).toContain(res.status);
  });

  test('permission: allow update with pos.update', async () => {
    // create table as admin
    const createRes = await request(app).post(`/api/restaurants/${restId}/tables`).set('Authorization', 'Bearer token').send({ name: 'P2', items: [] });
    expect(createRes.status).toBe(201);
    const t = createRes.body;
    // mock staff with pos.update
    admin.__helpers.auth.verifyIdToken.mockResolvedValue({ uid: 'staff4', admin: false, role: 'staff' });
    admin.__helpers.dbRefMap.set(`restaurants/${restId}/staff/staff4`, { roleId: 'roleYesUpdate' });
    admin.__helpers.dbRefMap.set(`restaurants/${restId}/roles/roleYesUpdate`, { permissions: { pos: { read: true, update: true } } });
    const res = await request(app).put(`/api/restaurants/${restId}/tables/${t.id}`).set('Authorization', 'Bearer token').send({ name: 'New 2', expectedUpdatedAt: t.updatedAt });
    expect(res.status).toBe(200);
    expect(res.body.name).toBe('New 2');
  });

  test('merge error: 400 when no source table provided', async () => {
    const res = await request(app)
      .post(`/api/restaurants/${restId}/tables/merge`)
      .set('Authorization', 'Bearer token')
      .send({ sourceTableIds: [], targetTableId: 'non' });
    expect(res.status).toBe(400);
  });

  test('merge error: 404 when target not found', async () => {
    // create source table
    const r1 = await request(app).post(`/api/restaurants/${restId}/tables`).set('Authorization', 'Bearer token').send({ name: 'S1', items: [] });
    expect(r1.status).toBe(201);
    const s1 = r1.body;
    const res = await request(app)
      .post(`/api/restaurants/${restId}/tables/merge`)
      .set('Authorization', 'Bearer token')
      .send({ sourceTableIds: [s1.id], targetTableId: 'notfound' });
    expect(res.status).toBe(404);
  });

  test('concurrency: 409 on stale update', async () => {
    // create table
    const createRes = await request(app)
      .post(`/api/restaurants/${restId}/tables`)
      .set('Authorization', 'Bearer token')
      .send({ name: 'Table A', items: [] });
    expect(createRes.status).toBe(201);
    const table = createRes.body;
    // update once with expected timestamp
    const expected = table.updatedAt || Date.now();
    const u1 = await request(app)
      .put(`/api/restaurants/${restId}/tables/${table.id}`)
      .set('Authorization', 'Bearer token')
      .send({ name: 'Updated 1', items: [], expectedUpdatedAt: expected });
    expect(u1.status).toBe(200);
    // attempt update with stale expectedUpdatedAt
    const u2 = await request(app)
      .put(`/api/restaurants/${restId}/tables/${table.id}`)
      .set('Authorization', 'Bearer token')
      .send({ name: 'Updated 2', items: [], expectedUpdatedAt: expected });
    expect(u2.status).toBe(409);
  });

  test('merge concurrency: 409 when expectedUpdatedAt mismatch', async () => {
    const res1 = await request(app)
      .post(`/api/restaurants/${restId}/tables`)
      .set('Authorization', 'Bearer token')
      .send({ name: 'A', items: [{ itemId: 'i1', name: 'A1', price: 100, quantity: 1 }] });
    expect(res1.status).toBe(201);
    const t1 = res1.body;
    const res2 = await request(app)
      .post(`/api/restaurants/${restId}/tables`)
      .set('Authorization', 'Bearer token')
      .send({ name: 'B', items: [{ itemId: 'i2', name: 'B2', price: 200, quantity: 1 }] });
    expect(res2.status).toBe(201);
    const t2 = res2.body;
    const res3 = await request(app)
      .post(`/api/restaurants/${restId}/tables`)
      .set('Authorization', 'Bearer token')
      .send({ name: 'Target', items: [] });
    expect(res3.status).toBe(201);
    const target = res3.body;

    // create expected map with outdated timestamp for t1
    const expectedMap = {};
    expectedMap[t1.id] = 0; // stale
    expectedMap[t2.id] = t2.updatedAt || 0;
    expectedMap[target.id] = target.updatedAt || 0;

    const mergeRes = await request(app)
      .post(`/api/restaurants/${restId}/tables/merge`)
      .set('Authorization', 'Bearer token')
      .send({ sourceTableIds: [t1.id, t2.id], targetTableId: target.id, expectedUpdatedAt: expectedMap });
    expect(mergeRes.status).toBe(409);
  });

  test('clear table concurrency: 409 on stale expectedUpdatedAt', async () => {
    const res = await request(app)
      .post(`/api/restaurants/${restId}/tables`)
      .set('Authorization', 'Bearer token')
      .send({ name: 'ClearTest', items: [{ itemId: 'i1', name: 'A1', price: 100, quantity: 1 }] });
    expect(res.status).toBe(201);
    const t = res.body;
    // Clear with correct timestamp
    const clearRes = await request(app)
      .post(`/api/restaurants/${restId}/tables/${t.id}/clear`)
      .set('Authorization', 'Bearer token')
      .send({ expectedUpdatedAt: t.updatedAt || 0 });
    expect(clearRes.status).toBe(200);
    // Attempt clear with stale timestamp (use original timestamp again)
    const clearRes2 = await request(app)
      .post(`/api/restaurants/${restId}/tables/${t.id}/clear`)
      .set('Authorization', 'Bearer token')
      .send({ expectedUpdatedAt: t.updatedAt || 0 });
    expect(clearRes2.status).toBe(409);
  });
});
