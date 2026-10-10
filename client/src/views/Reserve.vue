<script setup>
import { reactive, ref } from 'vue';
import { api } from '../api.js';
const blank = () => ({ name: '', phone: '', date: '', time: '18:00', guests: 2, notes: '' });
const f = reactive(blank()), msg = ref(''), err = ref('');
const today = new Date().toISOString().slice(0, 10);
async function submit() {
  msg.value = err.value = '';
  try {
    await api('/reservations', 'POST', { ...f });
    msg.value = `Thank you ${f.name}! Your request for ${f.guests} on ${f.date} at ${f.time} was received. We will confirm by phone.`;
    Object.assign(f, blank());
  } catch (e) { err.value = e.message; }
}
</script>
<template>
  <form class="panel" @submit.prevent="submit">
    <h2>Reserve a Table</h2>
    <div class="grid">
      <div><label>Full name</label><input v-model="f.name" required></div>
      <div><label>Phone</label><input v-model="f.phone" required></div>
      <div><label>Date</label><input type="date" v-model="f.date" :min="today" required></div>
      <div><label>Time</label><input type="time" v-model="f.time" min="11:00" max="21:00" required></div>
      <div><label>Guests</label><input type="number" v-model.number="f.guests" min="1" max="20" required></div>
    </div>
    <div style="margin-top:16px"><label>Notes (allergies, celebration...)</label><textarea v-model="f.notes" rows="2"></textarea></div>
    <div v-if="msg" class="msg ok">{{ msg }}</div>
    <div v-if="err" class="msg err">{{ err }}</div>
    <div class="row"><button type="submit">Request reservation</button></div>
  </form>
</template>
