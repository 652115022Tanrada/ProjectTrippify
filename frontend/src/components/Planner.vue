<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const showLoginModal = ref(false)
const user = ref(null)
const travelType = ref(null)

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
    <header class="w-full flex justify-between items-center py-6 px-8">
    <router-link to="/">
      <img src="/logo.png" alt="Logo" class="h-15 w-auto object-contain" />
    </router-link>
      <nav class="space-x-6 text-gray-800 font-medium">
      <router-link to="/" class="hover:text-sky-600">Home</router-link>
      <router-link to="/planner" class="hover:text-sky-600">Planner</router-link>
      <router-link to="/expense" class="hover:text-sky-600">Expense Tracker</router-link>
      <router-link to="/review" class="hover:text-sky-600">Trip Review</router-link>
      <button
          @click="showLoginModal = true"
          class="ml-4 bg-sky-400 text-white px-4 py-2 rounded-full hover:bg-sky-600"
        >
          Login
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

    <!-- Title -->
    <h2 class="text-3xl font-extrabold text-center mb-10">SMART TRIP PLANNER</h2>

    <!-- Center Wrapper -->
    <div class="flex items-center justify-center">
    <!-- Form -->
    <div class="w-full max-w-xl space-y-4">

    <!-- Destination Input -->
    <div class="flex flex-col sm:flex-row gap-4">
    <!-- From Field with Icon -->
    <div class="relative w-full">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
        <!-- Location Icon from Heroicons (or Font Awesome) -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="From"
        class="w-full pl-12 border border-gray-300 rounded-xl px-5 py-4 text-base shadow-sm focus:ring-2 focus:ring-green-200 outline-none"
      />
    </div>

    <!-- To Field with Icon -->
    <div class="relative w-full">
      <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      </span>
      <input
        type="text"
        placeholder="To"
        class="w-full pl-12 border border-gray-300 rounded-xl px-5 py-4 text-base shadow-sm focus:ring-2 focus:ring-green-200 outline-none"
      />
    </div>
    </div>

    <!-- Date Inputs -->
    <div class="flex flex-col sm:flex-row gap-4">
      <input
        type="date"
        class="w-full border border-gray-300 rounded-xl px-5 py-4 text-base shadow-sm focus:ring-2 focus:ring-green-200 outline-none"
      />
      <input
        type="date"
        class="w-full border border-gray-300 rounded-xl px-5 py-4 text-base shadow-sm focus:ring-2 focus:ring-green-200 outline-none"
      />
    </div>

    <!-- Budget plan Input with currency dropdown -->
    <div class="flex flex-col sm:flex-row gap-4">
      <div class="relative w-full">
        <!-- Icon ด้านซ้าย -->
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
            stroke-width="1.5" stroke="currentColor" class="size-6">
            <path stroke-linecap="round" stroke-linejoin="round"
              d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
          </svg>
        </span>

        <!-- Dropdown สกุลเงินด้านขวา -->
        <select
          class="absolute right-3 top-1/2 -translate-y-1/2 bg-transparent text-sm text-gray-700 outline-none"
        >
          <option>THB</option>
          <option>USD</option>
        </select>

        <input
          type="number"
          min="0"
          placeholder="Budget Plan"
          class="w-full pl-12 pr-28 border border-gray-300 rounded-xl px-5 py-4 text-base shadow-sm focus:ring-2 focus:ring-green-200 outline-none"
        />
      </div>
    </div>



    <div class="flex flex-col md:flex-row gap-4 w-full max-w-xl">
      <!-- Solo travel -->    
      <label
        class="flex items-center w-full md:w-1/2 cursor-pointer"
        :class="travelType === 'solo' ? '' : ''"
      >
      <span class="text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
        </svg>
      </span>
        <input
          type="radio"
          value="solo"
          v-model="travelType"
          class="ml-3 mr-2"
        />
        Solo travel
      </label>

      <!-- Group travel -->
      <label
        class="flex items-center w-full md:w-1/2 cursor-pointer"
        :class="travelType === 'group' ? '' : ''"
      >
      <span class="text-gray-500">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M18 18.72a9.094 9.094 0 0 0 3.741-.479 3 3 0 0 0-4.682-2.72m.94 3.198.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0 1 12 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 0 1 6 18.719m12 0a5.971 5.971 0 0 0-.941-3.197m0 0A5.995 5.995 0 0 0 12 12.75a5.995 5.995 0 0 0-5.058 2.772m0 0a3 3 0 0 0-4.681 2.72 8.986 8.986 0 0 0 3.74.477m.94-3.197a5.971 5.971 0 0 0-.94 3.197M15 6.75a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm6 3a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Zm-13.5 0a2.25 2.25 0 1 1-4.5 0 2.25 2.25 0 0 1 4.5 0Z" />
        </svg>
      </span>
        <input
          type="radio"
          value="group"
          v-model="travelType"
          class="ml-3 mr-2"
        />
        Group travel
        <input
          v-if="travelType === 'group'"
          type="number"
          min="1"
          placeholder="No. of people"
          class="ml-2 w-30 px-2 text-sm border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-green-200 outline-none"
        />
        </label>
        </div>

        <!-- Start Planning Button -->
        <div class="text-center pt-4">
          <router-link to="/tripdetail">
            <button class="bg-sky-400 text-white px-8 py-3 rounded-full font-semibold hover:bg-sky-600 transition">Start Planning</button>
          </router-link>
        </div>
    </div>
    </div>
  </div>
</template>


