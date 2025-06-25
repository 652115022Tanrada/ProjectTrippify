// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import Planner from './components/Planner.vue'
import Tripdetail from './components/Tripdetail.vue'
import Trips from './components/Trips.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/planner', component: Planner },
  { path: '/tripdetail', component: Tripdetail },
  { path: '/trips', component: Trips }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
