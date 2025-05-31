<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="p-8 bg-white rounded-xl shadow-md text-center space-y-6 w-full max-w-md">
      <template v-if="user">
        <!-- แสดงโปรไฟล์ -->
        <img :src="user.photos[0].value" class="w-24 h-24 rounded-full mx-auto mb-4" />
        <h2 class="text-xl font-bold">{{ user.displayName }}</h2>
        <p class="text-gray-600">{{ user.emails[0].value }}</p>
        <button @click="logout" class="mt-4 px-4 py-2 bg-gray-300 rounded hover:bg-gray-400">
          Logout
        </button>
      </template>

      <template v-else>
        <!-- ปุ่ม Login -->
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
</template>

<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'

const user = ref(null)

// ดึงข้อมูล user เมื่อโหลดหน้า
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