<script setup>
import { ref, reactive, onMounted } from 'vue';
import { api, peso } from '../api.js';
const key = ref(sessionStorage.getItem('adminKey') || ''), authed = ref(false), err = ref('');
const tab = ref('menu'), menu = ref([]), orders = ref([]), resv = ref([]), cats = ref([]);
const blank = () => ({ name: '', category: '', description: '', price: 0, available: true });
const form = reactive(blank()), editId = ref('');
const ORDER_ST = ['received', 'preparing', 'ready', 'completed', 'cancelled'], RES_ST = ['pending', 'confirmed', 'cancelled'];
async function load() {
  err.value = '';
  try {
    sessionStorage.setItem('adminKey', key.value);
    [orders.value, resv.value, menu.value, cats.value] =
      await Promise.all([api('/orders', 'GET', 0, 1), api('/reservations', 'GET', 0, 1), api('/menu'), api('/categories')]);
    authed.value = true;
  } catch (e) { authed.value = false; err.value = e.message; }
}
async function run(fn) { try { err.value = ''; await fn(); await load(); } catch (e) { err.value = e.message; } }
const saveMenu = () => run(async () => {
  await api(editId.value ? '/menu/' + editId.value : '/menu', editId.value ? 'PUT' : 'POST', { ...form }, true);
  clear();
});
function edit(m) { editId.value = m._id; Object.assign(form, m); }
function clear() { editId.value = ''; Object.assign(form, blank()); }
const delMenu = m => confirm(`Delete "${m.name}"?`) && run(() => api('/menu/' + m._id, 'DELETE', 0, true));
const setStatus = (kind, r, status) => run(() => api(`/${kind}/${r._id}`, 'PATCH', { status }, true));
const delRow = (kind, r) => confirm('Delete this record?') && run(() => api(`/${kind}/${r._id}`, 'DELETE', 0, true));
onMounted(() => key.value && load());
</script>
<template>
  <section v-if="!authed" class="panel">
    <h2>Staff Login</h2>
    <form class="row" style="margin-top:0" @submit.prevent="load">
      <input v-model="key" type="password" placeholder="Admin key" style="max-width:300px"><button>Enter</button>
    </form>
    <div v-if="err" class="msg err">{{ err }}</div>
  </section>
  <template v-else>
    <div class="tabs">
      <button v-for="t in ['menu', 'orders', 'reservations']" :key="t" class="chip" :class="{ on: tab === t }" @click="tab = t">{{ t }}</button>
    </div>
    <div v-if="err" class="msg err">{{ err }}</div>

    <section v-if="tab === 'menu'" class="panel">
      <h2>{{ editId ? 'Edit Dish' : 'Add Dish' }}</h2>
      <form @submit.prevent="saveMenu">
        <div class="grid">
          <div><label>Name</label><input v-model="form.name" required></div>
          <div><label>Category</label><select v-model="form.category" required><option v-for="c in cats" :key="c">{{ c }}</option></select></div>
          <div><label>Price</label><input type="number" min="0" v-model.number="form.price" required></div>
          <div><label>Description</label><input v-model="form.description"></div>
          <div><label>Available</label><select v-model="form.available"><option :value="true">Yes</option><option :value="false">Sold out</option></select></div>
        </div>
        <div class="row"><button>{{ editId ? 'Update dish' : 'Save dish' }}</button><button type="button" class="ghost" @click="clear">Clear</button></div>
      </form>
      <div class="wrap" style="margin-top:20px"><table>
        <thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Status</th><th>Actions</th></tr></thead>
        <tbody><tr v-for="m in menu" :key="m._id">
          <td>{{ m.name }}</td><td>{{ m.category }}</td><td>{{ peso(m.price) }}</td><td>{{ m.available ? 'Available' : 'Sold out' }}</td>
          <td><button class="sm edit" @click="edit(m)">Edit</button> <button class="sm del" @click="delMenu(m)">Delete</button></td>
        </tr></tbody>
      </table></div>
    </section>

    <section v-if="tab === 'orders'" class="panel">
      <h2>Orders</h2><p v-if="!orders.length" class="muted">No orders yet.</p>
      <div class="wrap"><table v-if="orders.length">
        <thead><tr><th>Customer</th><th>Type</th><th>Items</th><th>Total</th><th>Status</th><th></th></tr></thead>
        <tbody><tr v-for="o in orders" :key="o._id">
          <td>{{ o.customer }}<br><small class="muted">{{ o.phone }}</small></td><td>{{ o.type }}</td>
          <td><div v-for="i in o.items" :key="i.name">{{ i.qty }} x {{ i.name }}</div></td><td>{{ peso(o.total) }}</td>
          <td><select :value="o.status" @change="setStatus('orders', o, $event.target.value)"><option v-for="s in ORDER_ST" :key="s">{{ s }}</option></select></td>
          <td><button class="sm del" @click="delRow('orders', o)">Delete</button></td>
        </tr></tbody>
      </table></div>
    </section>

    <section v-if="tab === 'reservations'" class="panel">
      <h2>Reservations</h2><p v-if="!resv.length" class="muted">No reservations yet.</p>
      <div class="wrap"><table v-if="resv.length">
        <thead><tr><th>Guest</th><th>Date</th><th>Time</th><th>Party</th><th>Notes</th><th>Status</th><th></th></tr></thead>
        <tbody><tr v-for="r in resv" :key="r._id">
          <td>{{ r.name }}<br><small class="muted">{{ r.phone }}</small></td><td>{{ r.date }}</td><td>{{ r.time }}</td><td>{{ r.guests }}</td><td>{{ r.notes }}</td>
          <td><select :value="r.status" @change="setStatus('reservations', r, $event.target.value)"><option v-for="s in RES_ST" :key="s">{{ s }}</option></select></td>
          <td><button class="sm del" @click="delRow('reservations', r)">Delete</button></td>
        </tr></tbody>
      </table></div>
    </section>
  </template>
</template>
