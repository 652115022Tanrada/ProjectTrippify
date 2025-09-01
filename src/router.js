// src/router.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from './components/Home.vue'
import Planner from './components/Planner.vue'
import Tripdetail from './components/Tripdetail.vue'
import SavedTrips from './components/SavedTrips.vue'
import FullErrorPage from './error/FullErrorPage.vue'
import Expense from './components/Expense.vue'
import Review from './components/Review.vue'
import SavedTripReview from './components/SavedTripReview.vue'

const routes = [
  { path: '/', component: Home },
  { path: '/planner', component: Planner },
  { path: '/tripdetail', component: Tripdetail },
  { path: '/trip/:tripId', component: Tripdetail }, 
  { path: '/saved-trips', component: SavedTrips },
  { path: '/saved-trip-review', component: SavedTripReview },
  { path: '/expense', component: Expense },
  { path: '/trip/:tripId/review', component: Review},
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: FullErrorPage,
    props: {
      code: '404',
      title: 'Page Not Found',
      message: 'The page you’re looking for does not exist.'
    }
  },
  { path: '/expense', component: Expense }

]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
