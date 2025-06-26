<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import Swal from 'sweetalert2'
import { useRouter } from 'vue-router'

const router = useRouter()
const showLoginModal = ref(false)
const user = ref(null)

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

const handleStartPlanning = () => {
  if (user.value) {
    router.push('/planner')
  } else {
    Swal.fire({
      icon: 'warning',
      title: 'Please log in first',
      text: 'You need to log in to start planning your trip.',
      confirmButtonText: 'OK',
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


onMounted(getUser)
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 via-white to-green-100 text-gray-800">
    <header class="w-full flex justify-between items-center py-6 px-8">
      <router-link to="/">
        <img src="/logo.png" alt="Logo" class="h-15 w-auto object-contain" />
      </router-link>

      <nav class="flex items-center space-x-6 text-gray-800 font-bold font-kanit">
        <button @click="goToPage('/')" class="hover:text-sky-600">Home</button>
        <button @click="goToPage('/trips')" class="hover:text-sky-600">Planner</button>
        <button @click="goToPage('/expense')" class="hover:text-sky-600">Expense Tracker</button>
        <button @click="goToPage('/review')" class="hover:text-sky-600">Trip Review</button>

        <!-- ปุ่ม Login เฉพาะเมื่อไม่ได้ login -->
        <button
          v-if="!user"
          @click="showLoginModal = true"
          class="ml-4 bg-sky-400 text-white px-4 py-2 rounded-full hover:bg-sky-600"
        >
          Login
        </button>

        <!-- แสดงโปรไฟล์เล็กๆ เมื่อ login -->
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

    <main class="flex flex-col items-center text-center mt-10">
      <h1 class="text-4xl md:text-5xl font-bold text-sky-400 mb-3 font-mitr">
        One platform for all your<br />
        <span class="text-gray-900">travel planning needs</span>
      </h1>
      <p class="text-gray-700 max-w-xl mt-4 mb-6 font-kanit">
        Plan trips effortlessly with Trippify, your all-in-one travel assistant.
        From smart itineraries to shared expense tracking, everything your group needs in one place.
      </p>
      <button
        @click="handleStartPlanning"
        class="bg-sky-400 text-white px-6 py-3 rounded-full font-semibold hover:bg-sky-600 transition font-kanit"
      >
        Start Planning
      </button>
    </main>

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

    <footer class="flex flex-wrap justify-center items-center mt-20 space-x-6">
      <div class="text-sm text-gray-600 mt-4">Scratch map</div>
      <div class="text-sm text-gray-600 mt-4">Documents</div>
      <div class="text-sm text-gray-600 mt-4">eSIM</div>
      <div class="text-sm text-gray-600 mt-4">Profile</div>
      <div class="text-sm text-gray-600 mt-4">Checklist</div>
      <div class="text-sm text-gray-600 mt-4">Planner</div>
      <div class="text-sm text-gray-600 mt-4">Budget</div>
      <div class="text-sm text-gray-600 mt-4">Journal</div>
    </footer>
  </div>
</template>
