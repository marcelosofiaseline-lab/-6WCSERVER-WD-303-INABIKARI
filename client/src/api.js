import { reactive, computed } from 'vue';

export async function api(url, method = 'GET', body, admin = false) {
  const headers = { 'Content-Type': 'application/json' };
  if (admin) headers['x-admin-key'] = sessionStorage.getItem('adminKey') || '';
  const res = await fetch('/api' + url, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

// shared cart (lives for the browser session)
export const cart = reactive({
  items: JSON.parse(sessionStorage.getItem('cart') || '[]'),
  save() { sessionStorage.setItem('cart', JSON.stringify(this.items)); },
  add(m) {
    const f = this.items.find(i => i.id === m._id);
    f ? f.qty++ : this.items.push({ id: m._id, name: m.name, price: m.price, qty: 1 });
    this.save();
  },
  change(id, n) {
    const i = this.items.find(x => x.id === id); if (!i) return;
    i.qty += n; if (i.qty < 1) this.items = this.items.filter(x => x !== i);
    this.save();
  },
  clear() { this.items = []; this.save(); }
});
export const cartCount = computed(() => cart.items.reduce((s, i) => s + i.qty, 0));
export const cartTotal = computed(() => cart.items.reduce((s, i) => s + i.qty * i.price, 0));
export const peso = n => '\u20B1' + Number(n).toLocaleString('en-PH');
