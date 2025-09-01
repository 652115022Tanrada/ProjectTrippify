<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

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

  // ดึง tripId จากลิงก์ เช่น http://localhost:5173/trip/123456/join
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
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 via-white to-green-100 text-gray-800 font-kanit">
    <!-- Header -->
    <header class="w-full flex justify-between items-center py-6 px-8">
      <router-link to="/">
        <img src="/logo.png" alt="Logo" class="h-15 w-auto object-contain" />
      </router-link>

      <nav class="flex items-center space-x-6 text-gray-800 font-bold">
        <button @click="goToPage('/')" class="hover:text-sky-600">Home</button>
        <button @click="goToPage('/saved-trips')" class="hover:text-sky-600">Planner</button>
        <button @click="goToPage('/expense')" class="hover:text-sky-600">Expense Tracker</button>
        <button @click="goToPage('/review')" class="hover:text-sky-600">Trip Review</button>

        <button
          v-if="!user"
          @click="showLoginModal = true"
          class="ml-4 bg-sky-400 text-white px-4 py-2 rounded-full hover:bg-sky-600"
        >
          Login
        </button>

        <button
          v-else
          @click="showLoginModal = true"
          class="ml-4 h-10 w-10 rounded-full overflow-hidden hover:ring-2 hover:ring-sky-300 transition-all flex items-center justify-center"
        >
          <img :src="user.photo" alt="User" class="w-full h-full object-cover" />
        </button>
      </nav>
    </header>

    <!-- Main Content -->
    <!-- Center Wrapper: Trip List -->
    <div class="flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-5xl space-y-6">
        <!-- Header with New Trip Button -->
        <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-extrabold">Your Saved Trips</h2>
        <div class="flex space-x-2">
          <button
            @click="router.push('/planner')"
            class="bg-sky-400 text-white px-6 py-3 rounded-full font-semibold hover:bg-sky-600 transition"
        >
          + New Trip
        </button>
        <button
          @click="joinTripLinkModal = true"
          class="bg-green-400 text-white px-6 py-3 rounded-full font-semibold hover:bg-green-600 transition"
        >
          🔗 Join Trip via Link
        </button>
        </div>
        </div>

        <div v-if="savedTrips.length > 0" class="grid gap-6 w-full">
          <div
            v-for="trip in savedTrips"
            :key="trip._id"
            class="p-5 rounded-xl bg-white shadow hover:bg-sky-50 transition cursor-pointer"
            @click="viewTripDetail(trip.tripId)"
          >
            <h2 class="text-xl font-semibold text-sky-600">{{ trip.tripName || 'Unnamed Trip' }}</h2>
            <p class="text-gray-500 text-sm">Saved on: {{ new Date(trip.createdAt).toLocaleDateString() }}</p>
            <p class="text-gray-700 mt-2">Total Cost: {{ trip.total_trip_cost }} {{ trip.currency || 'THB' }}</p>
          </div>
        </div>

        <div v-else class="text-gray-500">No trips saved yet.</div>
      </div>
    </div>
    
    <!-- Login Modal -->
    <div
      v-if="showLoginModal"
      class="fixed inset-0 flex items-center justify-center z-50 bg-white/20 backdrop-blur-[3px]"
    >
      <div class="bg-white p-8 rounded-xl shadow-md text-center space-y-6 w-full max-w-md relative">
        <button
          @click="showLoginModal = false"
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>

        <template v-if="user">
          <img :src="user.photo" class="w-24 h-24 rounded-full mx-auto mb-4" />
          <h2 class="text-xl font-bold">{{ user.username }}</h2>
          <p class="text-gray-600">{{ user.gmail }}</p>
          <button
            @click="logout"
            class="mt-4 px-4 py-2 bg-red-400 text-white rounded hover:bg-red-500"
          >
            Logout
          </button>
        </template>

        <template v-else>
          <h1 class="text-2xl font-semibold text-gray-800">Welcome to Trippify</h1>
          <button
            @click="loginWithGoogle"
            class="flex items-center justify-center w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition duration-200 shadow-sm mx-auto"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google icon"
              class="w-5 h-5 mr-3"
            />
            <span class="text-sm font-medium text-gray-700">Continue with Google</span>
          </button>
        </template>
      </div>
    </div>
    <!-- Join Link Modal -->
    <div
      v-if="joinTripLinkModal"
      class="fixed inset-0 flex items-center justify-center z-50 bg-black/30 backdrop-blur-sm"
    >
      <div class="bg-white p-8 rounded-xl shadow-lg space-y-6 w-full max-w-md relative">
        <button
          @click="joinTripLinkModal = false"
          class="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-xl"
        >
          ✕
        </button>
        <h2 class="text-xl font-bold text-sky-700">Join Trip via Link</h2>
        <input
          v-model="joinLinkInput"
          type="text"
          placeholder="Paste the invite link here..."
          class="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:ring-2 focus:ring-sky-200 outline-none"
        />
        <button
          @click="submitJoinLink"
          class="w-full bg-sky-500 text-white px-4 py-2 rounded-lg hover:bg-sky-600 transition"
        >
          Join Trip
        </button>
      </div>
    </div>
  </div>
</template>
