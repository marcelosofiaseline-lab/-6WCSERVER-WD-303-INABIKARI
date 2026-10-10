const express = require('express');
const path = require('path');
const fs = require('fs');
const { ObjectId } = require('mongodb');
const connectToDatabase = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_KEY = process.env.ADMIN_KEY || 'inabikari-admin'; // change in production
app.use(express.json());

let db;
const col = n => db.collection(n);
const oid = id => (ObjectId.isValid(id) ? new ObjectId(id) : null);
const str = v => String(v ?? '').trim();
const fail = (res, code, error) => res.status(code).json({ error });
const wrap = fn => (req, res) => fn(req, res).catch(e => fail(res, 500, e.message));
const admin = (req, res, next) =>
  req.get('x-admin-key') === ADMIN_KEY ? next() : fail(res, 401, 'Admin key required.');

// ---------- MENU ----------
const CATS = ['Appetizers', 'Sushi & Sashimi', 'Ramen & Noodles', 'Rice & Mains', 'Dim Sum', 'Desserts', 'Drinks'];
function menuItem(b) {
  const d = { name: str(b.name), category: str(b.category), description: str(b.description),
    price: Number(b.price), available: b.available !== false };
  if (!d.name || !CATS.includes(d.category)) return { error: 'Name and a valid category are required.' };
  if (!(d.price >= 0)) return { error: 'Price must be 0 or more.' };
  return { d };
}
app.get('/api/menu', wrap(async (req, res) => {
  const f = {};
  if (req.query.category) f.category = str(req.query.category);
  res.json(await col('menu').find(f).sort({ category: 1, name: 1 }).toArray());
}));
app.get('/api/categories', (req, res) => res.json(CATS));
app.post('/api/menu', admin, wrap(async (req, res) => {
  const { d, error } = menuItem(req.body); if (error) return fail(res, 400, error);
  res.status(201).json(await col('menu').insertOne({ ...d, createdAt: new Date() }));
}));
app.put('/api/menu/:id', admin, wrap(async (req, res) => {
  const _id = oid(req.params.id); if (!_id) return fail(res, 400, 'Invalid id.');
  const { d, error } = menuItem(req.body); if (error) return fail(res, 400, error);
  const r = await col('menu').updateOne({ _id }, { $set: { ...d, updatedAt: new Date() } });
  r.matchedCount ? res.json(r) : fail(res, 404, 'Not found.');
}));
app.delete('/api/menu/:id', admin, wrap(async (req, res) => {
  const _id = oid(req.params.id); if (!_id) return fail(res, 400, 'Invalid id.');
  const r = await col('menu').deleteOne({ _id });
  r.deletedCount ? res.json(r) : fail(res, 404, 'Not found.');
}));

// ---------- RESERVATIONS ----------
app.post('/api/reservations', wrap(async (req, res) => {
  const b = req.body;
  const d = { name: str(b.name), phone: str(b.phone), date: str(b.date), time: str(b.time),
    guests: Number(b.guests), notes: str(b.notes), status: 'pending', createdAt: new Date() };
  if (!d.name || !d.phone || !d.date || !d.time) return fail(res, 400, 'Name, phone, date and time are required.');
  if (!Number.isInteger(d.guests) || d.guests < 1 || d.guests > 20) return fail(res, 400, 'Guests must be 1 to 20.');
  if (new Date(`${d.date}T${d.time}`) < new Date()) return fail(res, 400, 'Pick a future date and time.');
  res.status(201).json(await col('reservations').insertOne(d));
}));
app.get('/api/reservations', admin, wrap(async (req, res) =>
  res.json(await col('reservations').find().sort({ date: 1, time: 1 }).toArray())));

// ---------- ORDERS ----------
const STATUSES = ['received', 'preparing', 'ready', 'completed', 'cancelled'];
app.post('/api/orders', wrap(async (req, res) => {
  const b = req.body;
  const ids = (b.items || []).map(i => oid(i.id)).filter(Boolean);
  const menu = await col('menu').find({ _id: { $in: ids }, available: true }).toArray();
  // prices come from the database, never from the browser
  const items = (b.items || []).map(i => {
    const m = menu.find(x => String(x._id) === i.id); const qty = Number(i.qty);
    return m && Number.isInteger(qty) && qty > 0 ? { id: m._id, name: m.name, price: m.price, qty } : null;
  }).filter(Boolean);
  const d = { customer: str(b.customer), phone: str(b.phone), type: b.type === 'delivery' ? 'delivery' : 'pickup',
    address: str(b.address), items, status: 'received', createdAt: new Date() };
  if (!items.length) return fail(res, 400, 'Your cart is empty.');
  if (!d.customer || !d.phone) return fail(res, 400, 'Name and phone are required.');
  if (d.type === 'delivery' && !d.address) return fail(res, 400, 'Delivery address is required.');
  d.total = items.reduce((s, i) => s + i.price * i.qty, 0);
  const r = await col('orders').insertOne(d);
  res.status(201).json({ id: r.insertedId, total: d.total });
}));
app.get('/api/orders/:id', wrap(async (req, res) => { // customer tracking by order number
  const _id = oid(req.params.id); if (!_id) return fail(res, 400, 'Invalid order number.');
  const o = await col('orders').findOne({ _id }, { projection: { phone: 0, address: 0 } });
  o ? res.json(o) : fail(res, 404, 'Order not found.');
}));
app.get('/api/orders', admin, wrap(async (req, res) =>
  res.json(await col('orders').find().sort({ createdAt: -1 }).toArray())));

// status changes for orders and reservations
for (const [name, allowed] of [['orders', STATUSES], ['reservations', ['pending', 'confirmed', 'cancelled']]]) {
  app.patch(`/api/${name}/:id`, admin, wrap(async (req, res) => {
    const _id = oid(req.params.id); if (!_id) return fail(res, 400, 'Invalid id.');
    if (!allowed.includes(req.body.status)) return fail(res, 400, 'Invalid status.');
    const r = await col(name).updateOne({ _id }, { $set: { status: req.body.status, updatedAt: new Date() } });
    r.matchedCount ? res.json(r) : fail(res, 404, 'Not found.');
  }));
  app.delete(`/api/${name}/:id`, admin, wrap(async (req, res) => {
    const _id = oid(req.params.id); if (!_id) return fail(res, 400, 'Invalid id.');
    const r = await col(name).deleteOne({ _id });
    r.deletedCount ? res.json(r) : fail(res, 404, 'Not found.');
  }));
}

// ---------- Serve the built Vue app ----------
const dist = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(dist)) {
  app.use(express.static(dist));
  app.use((req, res, next) => (req.method === 'GET' && !req.path.startsWith('/api')
    ? res.sendFile(path.join(dist, 'index.html')) : next())); // Vue Router history mode
}

(async () => {
  db = await connectToDatabase();
  await col('menu').createIndex({ category: 1, name: 1 });
  app.listen(PORT, () => console.log(`Inabikari running at http://localhost:${PORT}`));
})().catch(e => { console.error(e); process.exit(1); });
