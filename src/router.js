// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import Planner from './components/Planner.vue'
import Tripdetail from './components/Tripdetail.vue'
import JoinTrip from './components/JoinTrip.vue'
import FullErrorPage from './error/FullErrorPage.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/planner', component: Planner },
  { path: '/tripdetail', component: Tripdetail },
  { path: '/trip/:tripId/join', component: JoinTrip },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: FullErrorPage,
    props: {
      code: '404',
      title: 'Page Not Found',
      message: 'The page you’re looking for does not exist.'
    }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
