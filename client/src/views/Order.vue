<script setup>
import { reactive, ref } from 'vue';
import { api, cart, cartTotal, peso } from '../api.js';
const f = reactive({ customer: '', phone: '', type: 'pickup', address: '' });
const err = ref(''), placed = ref(null), trackId = ref(''), tracked = ref(null);
async function place() {
  err.value = '';
  try {
    placed.value = await api('/orders', 'POST', { ...f, items: cart.items.map(i => ({ id: i.id, qty: i.qty })) });
    cart.clear();
  } catch (e) { err.value = e.message; }
}
async function track() {
  err.value = ''; tracked.value = null;
  try { tracked.value = await api('/orders/' + trackId.value.trim()); } catch (e) { err.value = e.message; }
}
</script>
<template>
  <section class="panel">
    <h2>Your Order</h2>
    <div v-if="placed" class="msg ok">
      Order placed! Total {{ peso(placed.total) }}. Your order number: <b>{{ placed.id }}</b> (save it to track your order).
    </div>
    <p v-else-if="!cart.items.length" class="muted">Your cart is empty. <router-link to="/menu">Browse the menu</router-link></p>
    <form v-else @submit.prevent="place">
      <div class="wrap"><table>
        <thead><tr><th>Dish</th><th>Qty</th><th>Price</th></tr></thead>
        <tbody><tr v-for="i in cart.items" :key="i.id">
          <td>{{ i.name }}</td>
          <td><button type="button" class="sm ghost" @click="cart.change(i.id, -1)">-</button> {{ i.qty }}
              <button type="button" class="sm ghost" @click="cart.change(i.id, 1)">+</button></td>
          <td>{{ peso(i.price * i.qty) }}</td>
        </tr></tbody>
      </table></div>
      <p class="price" style="text-align:right">Total: {{ peso(cartTotal) }}</p>
      <div class="grid">
        <div><label>Name</label><input v-model="f.customer" required></div>
        <div><label>Phone</label><input v-model="f.phone" required></div>
        <div><label>Type</label><select v-model="f.type"><option value="pickup">Pickup</option><option value="delivery">Delivery</option></select></div>
        <div v-if="f.type === 'delivery'"><label>Delivery address</label><input v-model="f.address" required></div>
      </div>
      <div class="row"><button type="submit">Place order</button></div>
    </form>
    <div v-if="err" class="msg err">{{ err }}</div>
  </section>
  <section class="panel">
    <h2>Track an Order</h2>
    <div class="row" style="margin-top:0"><input v-model="trackId" placeholder="Order number" style="max-width:340px"><button @click="track">Track</button></div>
    <div v-if="tracked" class="msg ok">Status: <b>{{ tracked.status }}</b> &middot; {{ tracked.items.length }} item type(s) &middot; {{ peso(tracked.total) }}</div>
  </section>
</template>
