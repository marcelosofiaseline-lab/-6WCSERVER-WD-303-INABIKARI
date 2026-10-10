import { createApp } from 'vue';
import { createRouter, createWebHistory } from 'vue-router';
import App from './App.vue';
import './style.css';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: () => import('./views/Home.vue') },
    { path: '/menu', component: () => import('./views/Menu.vue') },
    { path: '/reserve', component: () => import('./views/Reserve.vue') },
    { path: '/order', component: () => import('./views/Order.vue') },
    { path: '/admin', component: () => import('./views/Admin.vue') }
  ],
  scrollBehavior: () => ({ top: 0 })
});
createApp(App).use(router).mount('#app');
