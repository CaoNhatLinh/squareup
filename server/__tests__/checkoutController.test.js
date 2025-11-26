const request = require('supertest');
const app = require('../src/app');

// Mock verifyToken middleware to bypass auth in tests
jest.mock('../src/middleware/verifyToken', () => ({
  verifyToken: (req, res, next) => {
    req.user = { uid: 'test_user', admin: true, role: 'admin' };
    return next();
  },
  verifyMembership: (req, res, next) => next(),
  getDecodedUserFromRequest: async () => ({ uid: 'test_user', role: 'admin', admin: true }),
}));

describe('Checkout Controller - createOrderFromPOS', () => {
  it('should create a dine-in order with seatNumber', async () => {
    const orderData = {
      items: [{ itemId: 'i1', name: 'Burger', price: 10, quantity: 1 }],
      customerInfo: { name: 'John' },
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      orderType: 'dine_in',
      seatNumber: 'A12'
    };
    const res = await request(app).post('/api/orders/restaurant/rest_1').send(orderData).expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderType).toBe('dine_in');
    expect(res.body.data.seatNumber).toBe('A12');
  });

  it('should create a delivery order with address', async () => {
    const orderData = {
      items: [{ itemId: 'i2', name: 'Fries', price: 5, quantity: 1 }],
      customerInfo: { name: 'Jane' },
      paymentMethod: 'cash',
      paymentStatus: 'paid',
      orderType: 'delivery',
      deliveryAddress: { line1: '123 Main St', city: 'Testville', postalCode: '12345' }
    };
    const res = await request(app).post('/api/orders/restaurant/rest_1').send(orderData).expect(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.orderType).toBe('delivery');
    expect(res.body.data.deliveryAddress).toBeDefined();
    expect(res.body.data.deliveryAddress.line1).toBe('123 Main St');
  });
});
