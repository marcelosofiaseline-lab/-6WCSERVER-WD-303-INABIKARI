<script setup>
import { cartCount } from './api.js';
const links = [['/', 'Home'], ['/menu', 'Menu'], ['/reserve', 'Reserve'], ['/order', 'Order'], ['/admin', 'Admin']];
</script>
<template>
  <header class="nav">
    <router-link to="/" class="brand">Inabikari</router-link>
    <nav>
      <router-link v-for="[to, label] in links" :key="to" :to="to">
        {{ label }}<b v-if="to === '/order' && cartCount" class="badge">{{ cartCount }}</b>
      </router-link>
    </nav>
  </header>
  <main><router-view /></main>
  <footer>Inabikari Japanese &amp; Chinese Kitchen &middot; Angeles City &middot; Open daily 11:00 AM to 10:00 PM</footer>
</template>
