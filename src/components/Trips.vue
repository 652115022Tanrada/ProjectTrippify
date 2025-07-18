<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const router = useRouter()
const showLoginModal = ref(false)
const user = ref(null)

// mock data 
const trips = ref([
  {
    id: 1,
    coverImage: 'https://source.unsplash.com/featured/?beach',
    title: 'Trip to Phuket',
    startDate: '10 Jun 2025',
    endDate: '16 Jun 2025',
    budget: 10000,
    currency: 'THB', 
    destinations: ['Patong Beach', 'Big Buddha', 'Old Town']
  },
  {
    id: 2,
    coverImage: 'https://source.unsplash.com/featured/?mountain',
    title: 'Trip to Chiang Mai',
    startDate: '20 Jul 2025',
    endDate: '25 Jul 2025',
    budget: 10000,
    currency: 'THB',
    destinations: ['Doi Suthep', 'Old City']
  },
  {
    id: 3,
    coverImage: 'https://source.unsplash.com/featured/?city',
    title: 'Trip to Bangkok',
    startDate: '5 Aug 2025',
    endDate: '8 Aug 2025',
    budget: 10000,
    currency: 'THB',
    destinations: ['Grand Palace', 'Chatuchak Market']
  }
])

const getLocale = (currency) => {
  const map = {
    THB: 'th-TH',
    USD: 'en-US'
  }
  return map[currency] || 'en-US' // default
}

const goToTripDetail = (tripId) => {
  alert(`Go to Trip ID: ${tripId}`)
}

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

const loginWithGoogle = () => {
  window.location.href = 'http://localhost:5000/auth/google'
}

const logout = async () => {
  await axios.get('http://localhost:5000/auth/logout', {
    withCredentials: true
  })
  user.value = null
  window.location.reload()
}

onMounted(getUser)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 via-white to-green-100 text-gray-800">
    <!-- Header -->
    <header class="w-full flex justify-between items-center py-6 px-8">
      <router-link to="/">
        <img src="/logo.png" alt="Logo" class="h-15 w-auto object-contain" />
      </router-link>

      <nav class="flex items-center space-x-6 text-gray-800 font-medium">
        <router-link to="/" class="hover:text-sky-600">Home</router-link>
        <router-link to="/trips" class="hover:text-sky-600">Planner</router-link>
        <router-link to="/expense" class="hover:text-sky-600">Expense Tracker</router-link>
        <router-link to="/review" class="hover:text-sky-600">Trip Review</router-link>

        <!-- ปุ่ม Login -->
        <button
          v-if="!user"
          @click="showLoginModal = true"
          class="ml-4 bg-sky-400 text-white px-4 py-2 rounded-full hover:bg-sky-600"
        >
          Login
        </button>

        <!-- แสดงโปรไฟล์ -->
        <button
          v-else
          @click="showLoginModal = true"
          class="ml-4 h-10 w-10 rounded-full overflow-hidden hover:ring-2 hover:ring-sky-300 transition-all flex items-center justify-center"
        >
          <img
            :src="user.photos[0].value"
            alt="User"
            class="w-full h-full object-cover"
          />
        </button>
      </nav>
    </header>

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
          <img :src="user.photos[0].value" class="w-24 h-24 rounded-full mx-auto mb-4" />
          <h2 class="text-xl font-bold">{{ user.displayName }}</h2>
          <p class="text-gray-600">{{ user.emails[0].value }}</p>
          <button
            @click="logout"
            class="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
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

    <!-- Center Wrapper: Trip List -->
    <div class="flex items-center justify-center px-4 py-8">
      <div class="w-full max-w-5xl space-y-6">
        <!-- Header with New Trip Button -->
        <div class="flex justify-between items-center mb-6">
        <h2 class="text-2xl font-extrabold">Your Saved Trips</h2>
        <button
            @click="router.push('/planner')"
            class="bg-sky-400 text-white px-6 py-3 rounded-full font-semibold hover:bg-sky-600 transition"
        >
          + New Trip
        </button>
        </div>
        
        <div v-if="trips.length" class="space-y-6">
          <div
            v-for="trip in trips"
            :key="trip.id"
            class="bg-white rounded-xl shadow p-4 flex flex-col lg:flex-row items-center space-y-4 lg:space-y-0 lg:space-x-6 hover:shadow-lg transition"
          >
            <img :src="trip.coverImage" alt="Trip Cover" class="w-full lg:w-60 h-40 object-cover rounded-lg" />

            <div class="flex-1 space-y-2">
              <h2 class="text-xl font-semibold">{{ trip.title }}</h2>
              <p class="text-gray-600">{{ trip.startDate }} - {{ trip.endDate }}</p>
              <div class="flex space-x-4 text-sm text-gray-700">
                ⏳ {{ trip.budget.toLocaleString(getLocale(trip.currency), { 
                    style: 'currency', 
                    currency: trip.currency, 
                    minimumFractionDigits: 0, 
                    maximumFractionDigits: 0 
                }) }} budget
                <span>📍 {{ trip.destinations.length }} destinations</span>
              </div>
              <button
                @click="goToTripDetail(trip.id)"
                class="mt-2 bg-sky-500 text-white px-4 py-2 rounded hover:bg-sky-600"
              >
                View Details
              </button>
            </div>
          </div>
        </div>

        <div v-else class="text-center text-gray-500">
          No trips saved yet.
        </div>
      </div>
    </div>
  </div>
</template>
