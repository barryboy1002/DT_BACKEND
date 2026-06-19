import request from 'supertest';
import app from '../app.js';

jest.mock('../src/services/suppliersService.js', () => ({
  listSuppliersService: jest.fn(async (businessId) => ({ data: [{ supplier_id: 's1', name: 'Acme' }], meta: { page:1, limit:50 } })),
  getSupplierService: jest.fn(async (id, businessId) => ({ supplier_id: id, name: 'Acme' })),
  createSupplierService: jest.fn(async (businessId, payload) => ({ supplier_id: 'new', ...payload })),
  updateSupplierService: jest.fn(async (id, businessId, payload) => ({ supplier_id: id, ...payload })),
}));

describe('Suppliers routes', ()=>{
  test('GET /suppliers - 401 without business header', async ()=>{
    const res = await request(app).get('/suppliers');
    expect(res.status).toBe(401);
  });

  test('GET /suppliers - 200 with business header', async ()=>{
    const res = await request(app).get('/suppliers').set('X-Business-Id','biz1');
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  test('POST /suppliers - create', async ()=>{
    const payload = { name: 'New', phone: '070', email: 'a@b.com' };
    const res = await request(app).post('/suppliers').set('X-Business-Id','biz1').send(payload);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe('New');
  });
});
