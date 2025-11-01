<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();
const showLogin = ref(false);
const isLoading = ref(false);
const tripName = ref(""); // 🆕 เก็บชื่อทริป
const isFetching = ref(true); // 🆕 สถานะโหลดข้อมูลทริป
const tripMembers = ref([]);
const API_URL = import.meta.env.VITE_API_URL

// ดึงข้อมูลทริปจาก tripId
const fetchTripDetail = async () => {
  try {
    const tripId = route.params.tripId;
    if (!tripId) return;

    const res = await axios.get(`${API_URL}/api/trip/${tripId}`, { withCredentials: true });
    tripName.value = res.data.trip_name || "Unnamed Trip";
    tripMembers.value = res.data.members || [];
  } catch (err) {
    console.error("Failed to fetch trip:", err);
  } finally {
    isFetching.value = false;
  }
};

onMounted(() => {
  fetchTripDetail();
});

// state เพื่อควบคุมการแสดงของปุ่ม login
const handleJoinTrip = () => {
  isLoading.value = true;
  setTimeout(() => {
    isLoading.value = false;
    showLogin.value = true;
  }, 1000); // แสดงโลโก้ 1 วิ ก่อนโชว์ปุ่ม login
};

const loginWithGoogle = () => {
  isLoading.value = true;
  const tripPath = route.params.tripId ? `/trip/${route.params.tripId}` : "/";

  window.location.href = `${API_URL}/auth/google?redirect=http://localhost:5173${tripPath}`;
};
</script>

<template>
  <div
    class="relative flex flex-col items-center justify-center h-screen bg-[#FFFFFF] space-y-6"
  >
    <!-- 🌀 Loading Overlay -->
    <transition name="fade">
      <div
        v-if="isLoading"
        class="absolute inset-0 bg-white bg-opacity-80 flex flex-col items-center justify-center z-50"
      >
        <img src="/1.png" alt="Logo" class="w-24 h-24 animate-bounce" />
        <p class="text-[#000000] font-bold text-lg animate-pulse mt-4">
          Loading...
        </p>
      </div>
    </transition>

    <img src="/1.png" alt="Logo" class="h-24 w-auto object-contain" />
    <div class="bg-white text-center rounded-2xl shadow-xl p-8 max-w-md w-full">
      <h1 class="text-xl font-bold text-gray-800 mb-4">
        You’ve been invited to join this trip
      </h1>
      <!-- แสดงชื่อทริป -->
      <p
        v-if="!isFetching"
        class="text-2xl font-extrabold text-[#0D1282] mb-4 tracking-wide drop-shadow-sm"
      >
        {{ tripName }}
      </p>
      <div v-if="!isFetching && tripMembers?.length" class="flex items-center justify-center space-x-3 mb-4">
        <div v-for="member in tripMembers" :key="member.user_id" class="relative group">
          <!-- Crown สำหรับ Leader -->
          <span v-if="member.role === 'leader'" class="absolute -top-3 left-1/2 transform -translate-x-1/2 text-yellow-400 text-sm z-10">
            👑
          </span>

          <!-- Avatar -->
          <img v-if="member.photo" :src="member.photo" :alt="member.username" class="w-10 h-10 rounded-full border-2 border-gray-300" />
          <div v-else class="w-10 h-10 rounded-full border-2 border-gray-300 flex items-center justify-center bg-gray-200 text-gray-500 font-bold text-sm">
            {{ member.username?.charAt(0) || '?' }}
          </div>

          <!-- Tooltip ชื่อ -->
          <div class="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 hidden group-hover:block bg-[#0D1282] text-white text-xs rounded py-1 px-2 whitespace-nowrap">
            {{ member.username }}
          </div>
        </div>
      </div>
      <p v-else class="text-gray-500 mb-4">Loading trip details...</p>
      <p v-if="!showLogin" class="text-gray-600 mb-8">
        Click below to join and view the trip details.
      </p>

      <!-- ปุ่ม Join Trip -->
      <button
        v-if="!showLogin"
        @click="handleJoinTrip"
        class="w-full bg-[#0D1282] text-white font-medium rounded-lg px-4 py-3 hover:bg-[#1A1DA8] transition"
      >
        Join Trip
      </button>

      <!-- ปุ่ม Login with Google (ซ่อนจนกว่าจะกด Join) -->
      <div v-if="showLogin" class="space-y-4">
        <p class="text-gray-600">
          Please log in with Google to view the trip details.
        </p>

        <button
          @click="loginWithGoogle"
          class="flex items-center justify-center w-full border border-gray-300 rounded-lg px-4 py-3 bg-white hover:bg-gray-50 transition"
        >
          <img
            src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
            alt="Google icon"
            class="w-5 h-5 mr-3"
          />
          <span class="text-sm font-medium text-gray-700">
            Continue with Google
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Fade transition สำหรับ overlay */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.4s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
