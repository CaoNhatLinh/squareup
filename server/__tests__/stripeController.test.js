const request = require('supertest');
const app = require('../src/app');

// Mock stripe
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    products: {
      create: jest.fn(async ({ name }) => ({ id: 'prod_' + name.replace(/\s+/g, '_') }))
    },
    prices: {
      create: jest.fn(async ({ product, unit_amount }) => ({ id: `price_${product}_${unit_amount}` }))
    },
    paymentLinks: {
      create: jest.fn(async ({ line_items }) => ({ id: 'plink_test', url: 'https://pay.stripe.test/plink_test' }))
    },
    paymentIntents: {
      create: jest.fn(async ({ amount }) => ({ id: 'pi_test', status: 'succeeded', amount, currency: 'usd' })),
      retrieve: jest.fn(async (id) => ({ id, status: 'succeeded', amount: 1000, latest_charge: { id: 'ch_1' } }))
    },
    refunds: {
      create: jest.fn(async ({ charge }) => ({ id: 're_1', charge }))
    }
  }))
});

// Mock firebase-admin
jest.mock('firebase-admin', () => {
  const data = {};
  const ref = (path) => ({
    get: async () => ({
      exists: () => !!(path.split('/').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), data)),
      val: () => (path.split('/').reduce((o, k) => (o && o[k] !== undefined ? o[k] : undefined), data))
    }),
    set: async (value) => {
      const parts = path.split('/');
      let cur = data;
      for (let i = 0; i < parts.length - 1; i++) {
        cur[parts[i]] = cur[parts[i]] || {};
        cur = cur[parts[i]];
      }
      cur[parts[parts.length - 1]] = value;
      return value;
    },
    remove: async () => {
      const parts = path.split('/');
      let cur = data;
      for (let i = 0; i < parts.length - 1; i++) {
        if (!cur[parts[i]]) return;
        cur = cur[parts[i]];
      }
      delete cur[parts[parts.length - 1]];
    },
    push: () => ({ key: `key_${Date.now()}` })
  });
  return {
    database: () => ({ ref }),
    auth: () => ({})
  };
});

// Mock verifyToken middleware to bypass auth in tests
jest.mock('../src/middleware/verifyToken', () => ({
  verifyToken: (req, res, next) => {
    req.user = { uid: 'test_user', admin: true, role: 'admin' };
    return next();
  },
  verifyMembership: (req, res, next) => next(),
  getDecodedUserFromRequest: async () => ({ uid: 'test_user', role: 'admin', admin: true }),
}));

describe('Stripe Controller - createPaymentLink', () => {
  it('should create payment link and pending order', async () => {
    const payload = {
      orderId: 'order_123',
      restaurantId: 'rest_1',
      customerName: 'Alice',
      items: [
        { name: 'Burger', unitPrice: 5.0, quantity: 1, groupKey: 'burger_1', selectedOptions: [], modifiers: [] },
      ],
      subtotal: 5.0,
      total: 5.0,
      orderType: 'delivery',
      deliveryAddress: { line1: '123 Main St', city: 'Town', postalCode: '99999' }
    };

    const response = await request(app)
      .post('/api/stripe/create-payment-link')
      .send(payload)
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.url).toBeTruthy();
    expect(response.body.data.pendingOrderId).toBeTruthy();
    // ensure pending order has orderType and delivery address
    const pendingId = response.body.data.pendingOrderId;
    const pendingSnapshot = await require('firebase-admin').database().ref(`pendingOrders/${pendingId}`).get();
    expect(pendingSnapshot.val().orderType).toBe('delivery');
    expect(pendingSnapshot.val().deliveryAddress.line1).toBe('123 Main St');
  });
});

// Held orders endpoints deprecated: replaced with table-based storage

describe('Stripe Controller - processPayment', () => {
  it('should process card payment and create order for pending order', async () => {
    // create pending order via create-payment-link to get a pendingOrderId
    const payload = {
      orderId: 'order_abc',
      restaurantId: 'rest_100',
      customerName: 'Alice',
      items: [{ name: 'Pizza', unitPrice: 9.99, quantity: 1, groupKey: 'pizza_1' }],
      subtotal: 9.99,
      total: 9.99,
    };
    const createRes = await request(app).post('/api/stripe/create-payment-link').send(payload).expect(200);
    expect(createRes.body.success).toBe(true);
    const pendingOrderId = createRes.body.data.pendingOrderId;

    // Now simulate card payment with process-payment
    const processRes = await request(app).post('/api/stripe/process-payment')
      .send({ payment_method_id: 'pm_test', amount: 9.99, metadata: { pendingOrderId, restaurantId: 'rest_100' } })
      .expect(200);

    expect(processRes.body.success).toBe(true);
    expect(processRes.body.data.status).toBe('succeeded');
    // verify final order stored has orderType (null by default) and items
    const restaurantsDb = require('firebase-admin').database();
    const ordersSnap = await restaurantsDb.ref(`restaurants/rest_100/orders`).get();
    const ordersVal = ordersSnap.val();
    const createdOrder = Object.values(ordersVal).pop();
    expect(createdOrder).toBeDefined();
    expect(createdOrder.items).toBeDefined();
    expect(createdOrder.orderType).toBeDefined();
  });
});
