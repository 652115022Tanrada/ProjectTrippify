// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import Login from './components/Login.vue'
import Planner from './components/Planner.vue'
import Tripdetail from './components/Tripdetail.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/login', component: Login },
  { path: '/planner', component: Planner },
  { path: '/tripdetail', component: Tripdetail }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
