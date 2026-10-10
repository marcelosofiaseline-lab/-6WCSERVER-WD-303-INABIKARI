<script setup>
import { ref, computed, onMounted } from 'vue';
import { api, cart, peso } from '../api.js';
const items = ref([]), cats = ref([]), active = ref(''), search = ref(''), err = ref(''), added = ref('');
onMounted(async () => {
  try { [items.value, cats.value] = await Promise.all([api('/menu'), api('/categories')]); }
  catch (e) { err.value = e.message; }
});
const shown = computed(() => items.value.filter(i =>
  (!active.value || i.category === active.value) &&
  (i.name + i.description).toLowerCase().includes(search.value.toLowerCase())));
function add(m) { cart.add(m); added.value = m.name; setTimeout(() => (added.value = ''), 1500); }
</script>
<template>
  <section class="panel">
    <h2>Our Menu</h2>
    <input v-model="search" placeholder="Search dishes..." style="max-width:320px;margin-bottom:14px">
    <div class="chips">
      <button class="chip" :class="{ on: !active }" @click="active = ''">All</button>
      <button v-for="c in cats" :key="c" class="chip" :class="{ on: active === c }" @click="active = c">{{ c }}</button>
    </div>
    <div v-if="err" class="msg err">{{ err }}</div>
    <div v-if="added" class="msg ok">Added {{ added }} to your order.</div>
    <p v-if="!shown.length && !err" class="muted">No dishes found.</p>
    <div class="grid">
      <div v-for="m in shown" :key="m._id" class="card">
        <div><h3>{{ m.name }}</h3><p>{{ m.description }}</p></div>
        <div class="row" style="margin:0;justify-content:space-between">
          <span class="price">{{ peso(m.price) }}</span>
          <button class="sm" :disabled="!m.available" @click="add(m)">{{ m.available ? 'Add' : 'Sold out' }}</button>
        </div>
      </div>
    </div>
  </section>
</template>
