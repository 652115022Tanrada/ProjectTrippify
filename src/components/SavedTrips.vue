<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'
import Header from './Header.vue'

const savedTrips = ref([])
const router = useRouter()
const showLoginModal = ref(false)
const user = ref(null)
const joinTripLinkModal = ref(false)
const joinLinkInput = ref('')

const getUser = async () => {
  try {
    const res = await axios.get('http://localhost:5000/auth/user', {
      withCredentials: true
    })
    user.value = res.data
  } catch (err) {
    user.value = null
  }
}

const fetchSavedTrips = async () => {
  try {
    const res = await axios.get('http://localhost:5000/api/trip/mine', { withCredentials: true })
    console.log('Fetched trips:', res.data) // 🔍 debug
    savedTrips.value = Array.isArray(res.data) ? res.data : []
  } catch (err) {
    console.error('Failed to fetch saved trips:', err)
    savedTrips.value = []
  }
}

onMounted(async () => {
  await getUser()
  await fetchSavedTrips()
})

const loginWithGoogle = () => {
  window.location.href = 'http://localhost:5000/auth/google'
}

const logout = async () => {
  try {
    await axios.get('http://localhost:5000/auth/logout', { withCredentials: true })
    user.value = null
    showLoginModal.value = false
    await Swal.fire({
      icon: 'success',
      title: 'Logged Out',
      text: 'You have successfully logged out.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#0ea5e9'
    })
    router.push('/')
  } catch (error) {
    Swal.fire({
      icon: 'error',
      title: 'Logout Failed',
      text: 'Something went wrong. Please try again.',
      confirmButtonColor: '#0ea5e9'
    })
  }
}

const goToPage = (path) => {
  if (user.value) {
    router.push(path)
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Please log in first',
      text: 'You need to log in to access this page.',
      confirmButtonText: 'OK',
      confirmButtonColor: '#0ea5e9'
    })
  }
}

const viewTripDetail = (tripId) => {
  router.push(`/trip/${tripId}`)
}

const submitJoinLink = () => {
  if (!joinLinkInput.value || !joinLinkInput.value.includes('/trip/')) {
    Swal.fire({
      icon: 'warning',
      title: 'Invalid link',
      text: 'Please enter a valid trip link.',
      confirmButtonColor: '#0ea5e9'
    })
    return
  }

  const match = joinLinkInput.value.match(/\/trip\/([^/]+)/)
  const tripId = match ? match[1] : null

  if (tripId) {
    joinTripLinkModal.value = false
    joinLinkInput.value = ''
    router.push(`/trip/${tripId}`)
  } else {
    Swal.fire({
      icon: 'error',
      title: 'Join failed',
      text: 'Could not extract trip ID from the link.',
      confirmButtonColor: '#0ea5e9'
    })
  }
}


onMounted(() => {
  getUser()
  fetchSavedTrips()
})
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#FFFFFF] text-gray-800 font-kanit">
    <Header :user="user" @update:user="user = $event" />

    <div class="flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-6xl space-y-8">
        <div class="flex justify-between items-center mb-8">
          <h2 class="text-2xl font-extrabold text-[#0D1282] mb-4">Your Saved Trips</h2>
          <div class="flex space-x-4">
            <button
              @click="router.push('/planner')"
              class="bg-[#0D1282] text-[#FFFFFF] px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              <span class="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                <span>New Trip</span>
              </span>
            </button>
            <button
              @click="joinTripLinkModal = true"
              class="bg-[#D71313] text-[#FFFFFF] px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-md"
            >
              <span class="flex items-center space-x-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M18 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0ZM3 19.235v-.11a6.375 6.375 0 0 1 12.75 0v.109A12.318 12.318 0 0 1 9.374 21c-2.331 0-4.512-.645-6.374-1.766Z" />
                </svg>
                <span>Join Trip</span>
              </span>
            </button>
          </div>
        </div>

        <div v-if="savedTrips.length > 0" class="grid grid-cols-1 gap-6 w-full">
          <div
            v-for="trip in savedTrips"
            :key="trip.tripId"
            class="p-6 rounded-2xl bg-[#EEEDED] shadow-xl hover:shadow-2xl hover:bg-sky-50 transition-all duration-300 transform hover:scale-105 cursor-pointer"
            @click="viewTripDetail(trip.tripId)"
          >
            <div class="flex items-center space-x-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-10 w-10 text-[#0D1282]" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <div>
                <h3 class="text-xl font-bold text-[#0D1282]">{{ trip.tripName || 'Unnamed Trip' }}</h3>
                <p class="text-gray-500 text-sm mt-1">
                  <span class="font-semibold">Saved on:</span> {{ new Date(trip.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) }}
                </p>
              </div>
            </div>
            <div class="mt-4 border-t pt-4 border-gray-100">
              <p class="text-gray-700 font-semibold">Total Cost: <span class="text-green-600">{{ trip.total_trip_cost }} {{ trip.currency || 'THB' }}</span></p>
            </div>
          </div>
        </div>

        <div v-else class="text-center py-20 text-gray-500 text-xl font-semibold">
          <p>You haven't planned any trips yet.</p>
          <p>Let's start your first adventure!</p>
        </div>
      </div>
    </div>
  
    <div
      v-if="joinTripLinkModal"
      class="fixed inset-0 flex items-center justify-center z-50 bg-black/40 backdrop-blur-sm p-4"
    >
      <div class="bg-white p-8 rounded-2xl shadow-2xl space-y-6 w-full max-w-sm relative transform scale-100 transition-transform duration-300">
        <button
          @click="joinTripLinkModal = false"
          class="absolute top-4 right-4 text-gray-500 hover:text-gray-800 text-2xl font-bold transition"
        >
          ✕
        </button>
        <h2 class="text-2xl font-bold text-sky-700 text-center">Join Trip via Link</h2>
        <input
          v-model="joinLinkInput"
          type="text"
          placeholder="Paste the invite link here..."
          class="w-full border border-gray-300 rounded-lg px-4 py-3 text-base focus:ring-4 focus:ring-sky-200 focus:border-sky-500 outline-none transition"
        />
        <button
          @click="submitJoinLink"
          class="w-full bg-[#0D1282] text-white px-4 py-3 rounded-lg font-semibold hover:bg-sky-900 transition transform hover:scale-95"
        >
          Join Trip
        </button>
      </div>
    </div>
  </div>
</template>
