<template>
  <div class="flex items-center justify-center h-screen bg-gray-100">
    <div class="p-8 bg-white rounded-xl shadow-md text-center space-y-6">
      <h1 class="text-2xl font-semibold text-gray-800">Welcome to Trippify</h1>
      <button
        @click="loginWithGoogle"
        class="flex items-center justify-center w-full max-w-xs border border-gray-300 rounded-lg px-4 py-2 bg-white hover:bg-gray-50 transition duration-200 shadow-sm"
      >
        <img
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google icon"
          class="w-5 h-5 mr-3"
        />
        <span class="text-sm font-medium text-gray-700">Continue with Google</span>
      </button>
    </div>
  </div>
</template>

<script setup>
const loginWithGoogle = () => {
  // เปลี่ยน URL ด้านล่างให้ตรงกับ backend
  window.location.href = 'http://localhost:3000/auth/google'
}
</script>
