<script setup>
import { computed, watch, onMounted } from "vue";
import { useStore } from "vuex";
import Tripmap from "./Tripmap.vue";
import axios from "axios";
import { useRouter } from "vue-router";
import draggable from "vuedraggable";
import Swal from "sweetalert2";
import { useRoute } from "vue-router";
import { ref } from "vue";

const route = useRoute();
const router = useRouter();
const store = useStore();

const showLoginModal = ref(false);
const user = ref(null);
const tripId = route.params.tripId;
// ดึงแผนทริปจาก Vuex store
const tripPlan = computed(() => store.state.trip.tripPlan);
const transportInfo = computed(() => tripPlan.value?.transport_info || null);
const tripName = computed(() => tripPlan.value?.tripName || "My Trip");

// Tab ปัจจุบัน ระหว่าง destinations กับ nearby
const currentTab = ref("destinations"); // หรือ 'nearby'
// กำหนดตำแหน่งแรกของวันแรกสำหรับดึงพิกัดสถานที่ใกล้เคียง
const firstPlace = computed(() => tripPlan.value?.days?.[0]?.locations?.[0] || null);
const lat = computed(() => firstPlace.value?.lat || firstPlace.value?.latitude);
const lng = computed(() => firstPlace.value?.lng || firstPlace.value?.longitude);
const selectedLocationIndex = ref(0); // หรือ null ถ้ายังไม่มีค่า
const selectedDay = ref(0); // ถ้าคุณกำลังใช้วันที่แรก
const trip = ref(null);
const isSavingTrip = ref(false);
const nearbyPlaces = ref([]);
const loadError = ref('')
const inviteLink = ref("");
const isEditing = ref(false); 


const getUser = async () => {
  try {
    const res = await axios.get("http://localhost:5000/auth/user", {
      withCredentials: true,
    });
    user.value = res.data;
    console.log("User data:", user.value);
  } catch (err) {
    user.value = null;
  }
};

const loginWithGoogle = () => {
  window.location.href = "http://localhost:5000/auth/google";
};

const logout = async () => {
  try {
    await axios.get("http://localhost:5000/auth/logout", {
      withCredentials: true,
    });
    user.value = null;
    showLoginModal.value = false; // ปิด modal ทันที

    await Swal.fire({
      icon: "success",
      title: "Logged Out",
      text: "You have successfully logged out.",
      confirmButtonText: "OK",
      confirmButtonColor: "#0ea5e9",
    });

    router.push("/"); // กลับไปหน้า Home
  } catch (error) {
    console.error("Logout failed:", error);
    Swal.fire({
      icon: "error",
      title: "Logout Failed",
      text: "Something went wrong. Please try again.",
      confirmButtonColor: "#0ea5e9",
    });
  }
};

const goToPage = (path) => {
  if (user.value) {
    router.push(path);
  } else {
    Swal.fire({
      icon: "warning",
      title: "Please log in first",
      text: "You need to log in to access this page.",
      confirmButtonText: "OK",
      confirmButtonColor: "#0ea5e9",
    });
  }
};

watch(
  () => tripPlan.value,
  (newVal) => {
    store.commit("trip/updateTripPlan", newVal);
  },
  { deep: true }
);
const saveTrip = async () => {
  if (isSavingTrip.value) return;
  if (!tripPlan.value) return;

  isSavingTrip.value = true;

  try {
    const payload = { ...tripPlan.value }; // copy object
    // ถ้ามี tripId อยู่แล้ว → อัปเดต
    // ถ้าไม่มี → backend จะสร้างใหม่
    console.log("Saving trip with ID:", payload.tripId || "(new trip)");

    const response = await axios.post(
      "http://localhost:5000/api/trip/saveOrUpdate",
      payload,
      { withCredentials: true }
    );

    // response ต้อง return object ที่มี tripId
    const savedTrip = response.data;
    console.log("Saved trip:", savedTrip);

    // อัปเดต Vuex ให้ตรงกับ backend response
    store.commit("trip/updateTripPlan", savedTrip);

    // อัปเดต local tripId
    trip.value = savedTrip;

    router.push(`/trip/${savedTrip.tripId}`);
    Swal.fire({
      icon: "success",
      title: "Trip saved!",
      text: "Your trip plan has been saved successfully.",
      timer: 1500,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error("Save trip failed", err);
    Swal.fire({
      icon: "error",
      title: "Save Failed",
      text: "Something went wrong. Please try again.",
      confirmButtonColor: "#0ea5e9",
    });
  } finally {
    isSavingTrip.value = false;
  }
};



// const generateInviteLink = () => {
//   const tripId = tripPlan.value?.tripId;
//   if (!tripId) {
//     Swal.fire({
//       icon: "warning",
//       title: "Trip not saved yet!",
//       text: "Please save your trip before sharing.",
//     });
//     return;
//   }
//   inviteLink.value = `${window.location.origin}/trip/${tripId}/join`;
//   console.log("Generated invite link:", inviteLink.value);
// };

const copyToClipboard = () => {
  navigator.clipboard.writeText(inviteLink.value);
  Swal.fire({
    icon: "success",
    title: "Copied!",
    text: "Invite link copied to clipboard.",
    timer: 1500,
    showConfirmButton: false,
  });
};

const modifyTrip = () => {
  isEditing.value = !isEditing.value;
};


const cancelTrip = () => {
  Swal.fire({
    title: "Cancel this trip?",
    text: "Are you sure you want to cancel and discard your trip plan?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#0ea5e9",
    cancelButtonColor: "#a0aec0",
    confirmButtonText: "Yes, cancel it",
    cancelButtonText: "No, keep it",
  }).then((result) => {
    if (result.isConfirmed) {
      store.commit("trip/clearTripPlan");
      router.push("/");

      Swal.fire({
        icon: "info",
        title: "Trip cancelled",
        text: "Your trip plan has been discarded.",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
};

// ฟังก์ชันลบสถานที่จากวันนั้น ๆ
const removeLocation = (dayIndex, locIndex) => {
  Swal.fire({
    title: "Are you sure?",
    text: "Do you really want to remove this location from your trip plan?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#0ea5e9",
    cancelButtonColor: "#a0aec0",
    confirmButtonText: "Yes, remove it!",
    cancelButtonText: "Cancel",
  }).then((result) => {
    if (result.isConfirmed) {
      tripPlan.value.days[dayIndex].locations.splice(locIndex, 1);
      //คำนวณค่าใช้จ่ายหลังลบ
      recalculateCosts();
      store.commit("trip/updateTripPlan", tripPlan.value);

      Swal.fire({
        title: "Removed!",
        text: "The location has been removed from your trip plan.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    }
  });
};

const recalculateCosts = () => {
  let totalTripCost = 0;

  tripPlan.value.days.forEach((day) => {
    let dayCost = 0;

    if (day.locations && day.locations.length > 0) {
      day.locations.forEach((loc) => {
        const cost = parseFloat(loc.estimated_cost) || 0;
        dayCost += cost;
      });
    }

    day.total_day_cost = dayCost;
    totalTripCost += dayCost;
  });

  tripPlan.value.total_trip_cost = totalTripCost;
};

const allLocations = computed(() => {
  return (
    tripPlan.value?.days
      ?.flatMap((day) =>
        (day.locations || []).map((loc) => {
          const latNum = Number(loc.lat ?? loc.latitude);
          const lngNum = Number(loc.lng ?? loc.longitude);
          return {
            ...loc,
            name: typeof loc.name === "string" ? loc.name : "Unknown Place",
            lat: !isNaN(latNum) ? latNum : null,
            lng: !isNaN(lngNum) ? lngNum : null,
          };
        })
      )
      .filter((l) => l.lat !== null && l.lng !== null) || []
  );
});

// ฟังก์ชันช่วยโหลด nearby โดยใช้พิกัดปัจจุบัน (จาก firstPlace หรือ selected location)
const fetchNearby = async () => {
  let useLat = null;
  let useLng = null;

  // ถ้ามี selected location ของวันนั้น ให้ใช้
  const dayData = tripPlan.value?.days?.[selectedDay.value];
  if (
    dayData &&
    Array.isArray(dayData.locations) &&
    dayData.locations.length > selectedLocationIndex.value
  ) {
    const currentLocation = dayData.locations[selectedLocationIndex.value];
    if (currentLocation?.lat && currentLocation?.lng) {
      useLat = currentLocation.lat;
      useLng = currentLocation.lng;
    }
  }

  // ถ้าไม่มีก็ fallback ไปที่ firstPlace
  if (!useLat || !useLng) {
    if (lat.value && lng.value) {
      useLat = lat.value;
      useLng = lng.value;
    }
  }

  if (useLat && useLng) {
    await fetchNearbyPlaces(useLat, useLng);
  } else {
    nearbyPlaces.value = [];
    console.warn("No valid coordinates to fetch nearby places.");
  }
};

const fetchNearbyPlaces = async (latParam, lngParam) => {
  try {
    const response = await axios.get(`/api/nearby?lat=${latParam}&lng=${lngParam}`);
    nearbyPlaces.value = response.data || [];
  } catch (error) {
    console.error("Error fetching nearby places:", error);
    nearbyPlaces.value = [];
  }
};

// เมื่อเปลี่ยน selectedLocationIndex ให้โหลด nearby จาก location นั้น
watch(
  () => selectedLocationIndex.value,
  async (newIndex) => {
    const dayData = tripPlan.value?.days?.[selectedDay.value];
    if (
      dayData &&
      Array.isArray(dayData.locations) &&
      dayData.locations.length > newIndex
    ) {
      const currentLocation = dayData.locations[newIndex];
      if (currentLocation?.lat && currentLocation?.lng) {
        await fetchNearbyPlaces(currentLocation.lat, currentLocation.lng);
      }
    }
  },
  { immediate: true }
);

// เมื่อเปลี่ยน tab เป็น nearby ให้โหลดสถานที่ใกล้เคียง
watch(currentTab, (newTab) => {
  if (newTab === 'nearby') {
    fetchNearby();
  }
});

// เพิ่มสถานที่ใกล้เคียงในแผนทริป
const addToPlan = (place) => {
  if (!tripPlan.value || !tripPlan.value.days.length) return;
  const newLocation = {
    name: place.name || "Unknown",
    category: place.category || "Nearby",
    transport: "",
    estimated_cost: 0,
    currency: tripPlan.value.currency || "THB",
    distance_to_next: "N/A",
    lat: Number(place.lat) || null,
    lng: Number(place.lng) || null,
    time: "", // เติมตามต้องการ
  };
  tripPlan.value.days[0].locations.push(newLocation);
  recalculateCosts();
  store.commit("trip/updateTripPlan", tripPlan.value);
  Swal.fire({
    icon: "success",
    title: "Added!",
    text: `${newLocation.name} added to your trip plan.`,
    timer: 1500,
    showConfirmButton: false,
  });
};

// onMounted(async () => {
//   try {
//     const tripId = route.params.tripId
//     const response = await axios.get(`http://localhost:5000/api/nearby/${tripId}`, {
//       withCredentials: true
//     })
//     nearbyData.value = response.data
//   } catch (err) {
//     console.error(err)
//     loadError.value = 'ไม่สามารถโหลดสถานที่ใกล้เคียงได้'
//   }
// });

// โหลด user และ nearby places ตอน mount
onMounted(async () => {
  if (route.params.tripId) {
    const { data } = await axios.get(
      `http://localhost:5000/api/trip/${route.params.tripId}`, 
      { withCredentials: true }
    );
    // อัปเดต Vuex tripPlan ให้ครบทุก field รวม tripId
    store.commit("trip/updateTripPlan", data);
    trip.value = data;

    console.log("Loaded trip plan:", data);  // <<< ตรวจสอบ tripId
  }
});
</script>

<template>
  <div
    class="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-kanit"
  >
    <header class="w-full flex justify-between items-center py-4 px-8 bg-white shadow-sm sticky top-0 z-10">
      <router-link to="/">
        <img src="/logo.png" alt="Logo" class="h-10 w-auto" />
      </router-link>

      <nav
        class="flex items-center space-x-6 text-gray-700 font-medium text-sm"
      >
        <router-link to="/" class="hover:text-sky-600 transition">Home</router-link>
        <router-link to="/saved-trips" class="hover:text-sky-600 transition">Planner</router-link>
        <router-link to="/expense" class="hover:text-sky-600 transition">Expense Tracker</router-link>
        <router-link to="/review" class="hover:text-sky-600 transition">Trip Review</router-link>

        <button
          v-if="!user"
          @click="showLoginModal = true"
          class="ml-4 bg-sky-500 text-white px-4 py-2 rounded-full hover:bg-sky-600 transition shadow"
        >
          Login
        </button>
        <button
          v-else
          @click="showLoginModal = true"
          class="ml-4 h-10 w-10 rounded-full overflow-hidden hover:ring-2 hover:ring-sky-300 transition-all flex items-center justify-center"
        >
          <img
            :src="user.photo"
            alt="User"
            class="w-full h-full object-cover"
          />
        </button>
      </nav>
    </header>

    <div
      v-if="showLoginModal"
      class="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-40 backdrop-blur-sm"
    >
      <div
        class="bg-white p-8 rounded-2xl shadow-xl text-center space-y-6 w-full max-w-sm relative"
      >
        <button
          @click="showLoginModal = false"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-700 text-2xl transition"
        >
          ✕
        </button>

        <template v-if="user">
          <img :src="user.photo" class="w-24 h-24 rounded-full mx-auto ring-4 ring-sky-200 mb-4" />
          <h2 class="text-xl font-bold text-gray-800">{{ user.username }}</h2>
          <p class="text-gray-500 text-sm">{{ user.gmail }}</p>
          <button
            @click="logout"
            class="mt-4 px-6 py-2 bg-red-500 text-white font-semibold rounded-full hover:bg-red-600 transition shadow"
          >
            Logout
          </button>
        </template>

        <template v-else>
          <h1 class="text-2xl font-bold text-gray-800">
            Welcome to Trippify
          </h1>
          <p class="text-gray-500">Plan your perfect trip with ease.</p>
          <button
            @click="loginWithGoogle"
            class="flex items-center justify-center w-full max-w-xs border border-gray-300 rounded-full px-4 py-3 bg-white hover:bg-gray-100 transition duration-200 shadow-md mx-auto"
          >
            <img
              src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
              alt="Google icon"
              class="w-5 h-5 mr-3"
            />
            <span class="text-sm font-medium text-gray-700"
              >Continue with Google</span
            >
          </button>
        </template>
      </div>
    </div>

    <div v-if="tripPlan" class="flex flex-1 overflow-hidden">
      <div
        class="w-[50%] p-8 overflow-y-auto bg-white shadow-2xl"
      >
        <h1 class="text-3xl font-extrabold text-gray-800 mb-2">
          {{ tripName }}
        </h1>
        <p class="text-gray-500 text-sm mb-6">Your personalized travel itinerary.</p>

        <div class="flex items-center justify-between mb-6">
          <!-- Tabs -->
          <div class="flex gap-2">
            <button
              @click="currentTab = 'destinations'"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                currentTab === 'destinations'
                  ? 'bg-sky-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
              </svg>
              Destinations
            </button>

            <button
              @click="currentTab = 'nearby'"
              :class="[
                'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors',
                currentTab === 'nearby'
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              ]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M9 6.75V15m6-6v8.25m.503 3.498 4.875-2.437c.381-.19.622-.58.622-1.006V4.82c0-.836-.88-1.38-1.628-1.006l-3.869 1.934c-.317.159-.69.159-1.006 0L9.503 3.252a1.125 1.125 0 0 0-1.006 0L3.622 5.689C3.24 5.88 3 6.27 3 6.695V19.18c0 .836.88 1.38 1.628 1.006l3.869-1.934c.317-.159.69-.159 1.006 0l4.994 2.497c.317.158.69.158 1.006 0Z" />
              </svg>
              Nearby Places
            </button>
          </div>

          <!-- Expense Button -->
          <button
            @click="goToPage(`/expense?tripId=${tripPlan?.tripId || ''}`)"
            class="flex items-center gap-2 bg-rose-500 hover:bg-rose-600 text-white text-sm font-medium px-4 py-2 rounded-full transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
            </svg>
            Expense
          </button>
        </div>


        <div v-if="currentTab === 'destinations'">
          <div class="mb-8 bg-sky-50 p-6 rounded-2xl shadow-inner">
            <h2 class="text-xl font-bold text-sky-700 mb-4">
              <i class="fa-solid fa-plane-departure mr-2"></i> Transportation
            </h2>

            <div class="overflow-x-auto">
              <table class="w-full text-left border-collapse">
                <thead>
                  <tr class="bg-sky-100 text-sky-900 font-semibold text-sm">
                    <th class="p-3 rounded-tl-xl"></th>
                    <th class="p-3 text-center">🚗 Car</th>
                    <th class="p-3 text-center">🚌 Bus</th>
                    <th class="p-3 text-center">🚆 Train</th>
                    <th class="p-3 text-center rounded-tr-xl">✈️ Flight</th>
                  </tr>
                </thead>
                <tbody>
                  <tr class="border-b border-sky-200">
                    <td class="p-3 text-gray-700 font-medium">Distance</td>
                    <td class="p-3 text-center">{{ transportInfo.car?.distance || "-" }}</td>
                    <td class="p-3 text-center">{{ transportInfo.bus?.distance || "-" }}</td>
                    <td class="p-3 text-center">{{ transportInfo.train?.distance || "-" }}</td>
                    <td class="p-3 text-center">{{ transportInfo.flight?.distance || "-" }}</td>
                  </tr>
                  <tr class="bg-white">
                    <td class="p-3 text-gray-700 font-medium">Duration</td>
                    <td class="p-3 text-center">{{ transportInfo.car?.duration || "-" }}</td>
                    <td class="p-3 text-center">{{ transportInfo.bus?.duration || "-" }}</td>
                    <td class="p-3 text-center">{{ transportInfo.train?.duration || "-" }}</td>
                    <td class="p-3 text-center">{{ transportInfo.flight?.duration || "-" }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div
            v-for="(day, index) in tripPlan.days"
            :key="index"
            class="mb-8 bg-sky-50 p-6 rounded-2xl shadow-inner"
          >
            <h2 class="text-xl font-bold text-sky-700 mb-2 flex items-center">
              <span class="bg-sky-500 text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mr-2">{{ index + 1 }}</span>
              Day {{ index + 1 }}: {{ day.title }}
            </h2>
            <p class="text-gray-500 mb-4 text-sm">{{ day.date }}</p>
            <p class="text-gray-700 mb-6 text-sm">
              {{ day.description || day.narrative || "No description." }}
            </p>

            <div
              class="grid grid-cols-7 gap-2 px-4 py-3 bg-sky-100 text-sky-900 font-semibold text-sm rounded-t-lg"
            >
              <div class="col-span-2">Destination</div>
              <div class="text-center">Category</div>
              <div class="text-center">Transport</div>
              <div class="text-center">Expense</div>
              <div class="text-center">Distance</div>
              <div class="text-center"></div>
            </div>

            <draggable
              v-model="day.locations"
              :group="'locations'"
              item-key="name"
              :disabled="!isEditing" 
              class="space-y-2"
              @change="recalculateCosts"
            >
              <template #item="{ element: loc, index: i }">
                <div
                  class="grid grid-cols-7 gap-2 px-4 py-3 bg-white border-b border-gray-200 text-sm items-center hover:bg-sky-50 transition rounded-md shadow-sm cursor-grab"
                >
                  <div class="col-span-2 font-medium text-gray-800">
                    <i class="fa-solid fa-map-pin text-sky-400 mr-2"></i>{{ loc.name }}
                  </div>
                  <div class="text-center text-gray-600">
                    {{ loc.category || "N/A" }}
                  </div>
                  <div class="text-center text-gray-600">
                    {{ loc.transport || "N/A" }}
                  </div>
                  <div class="text-center text-green-700 font-medium">
                    {{ loc.estimated_cost || 0 }} {{ loc.currency || tripPlan.currency || "THB" }}
                  </div>
                  <div class="text-center text-gray-600">
                    {{ loc.distance_to_next || "N/A" }}
                  </div>
                  <div class="text-center" v-if="isEditing">
                    <button
                      @click="removeLocation(index, i)"
                      class="text-red-500 hover:text-red-700 transition"
                      title="Delete location"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"
                        stroke-width="1.5" stroke="currentColor" class="size-6">
                        <path stroke-linecap="round" stroke-linejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9
                            m9.968-3.21c.342.052.682.107 1.022.166
                            m-1.022-.165L18.16 19.673a2.25 2.25 0 0
                            1-2.244 2.077H8.084a2.25 2.25 0 0
                            1-2.244-2.077L4.772 5.79
                            m14.456 0a48.108 48.108 0 0
                            0-3.478-.397
                            m-12 .562c.34-.059.68-.114 1.022-.165
                            m0 0a48.11 48.11 0 0 1 3.478-.397
                            m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201
                            a51.964 51.964 0 0 0-3.32 0
                            c-1.18.037-2.09 1.022-2.09 2.201v.916
                            m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </div>
              </template>
            </draggable>

            <div class="mt-4 text-sm text-gray-700">
              <p
                v-if="day.daily_tips && day.daily_tips.length > 0"
                class="mb-1"
              >
                💡 <span class="font-medium">Tips:</span>
                {{ day.daily_tips.join(", ") }}
              </p>
              <p class="font-semibold text-right text-sky-700 text-lg">
                💰 Day Total: {{ day.total_day_cost || 0 }}
                {{ tripPlan.currency || "THB" }}
              </p>
            </div>
          </div>

          <div
            class="text-right mt-8 text-xl font-bold text-green-700 border-t border-gray-200 pt-6"
          >
            🧾 Total Trip Cost: {{ tripPlan.total_trip_cost || 0 }}
            {{ tripPlan.currency || "THB" }}
          </div>

          <div class="mt-6 flex justify-end gap-4">
            <button
              @click="cancelTrip"
              class="bg-gray-300 hover:bg-gray-400 text-gray-700 font-semibold py-2 px-6 rounded-full shadow transition"
            >
              Cancel
            </button>
            <button
              @click="modifyTrip"
              :class="[
                'font-semibold py-2 px-6 rounded-full shadow transition text-white',
                isEditing ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-yellow-500 hover:bg-yellow-600'
              ]"
            >
              {{ isEditing ? 'Done Modify Trip' : 'Modify Trip' }}
            </button>
            <button
              @click="saveTrip"
              :disabled="isSavingTrip"
              class="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <i class="fa-solid fa-floppy-disk mr-2"></i> Save Trip
            </button>
            <!-- <button
              @click="generateInviteLink"
              class="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-6 rounded-full shadow-md transition"
            >
              Share
            </button> -->
          </div>

          <div v-if="inviteLink" class="text-right text-sm mt-6">
            <p class="text-gray-600 font-semibold mb-1">Share this link with your friends:</p>
            <div class="relative flex items-center">
              <input
                class="w-full border border-gray-300 rounded-full pl-4 pr-12 py-3 text-sm text-gray-500 shadow-sm focus:ring-2 focus:ring-emerald-200 outline-none cursor-pointer"
                :value="inviteLink"
                readonly
                @click="copyToClipboard"
              />
              <button
                @click="copyToClipboard"
                class="absolute right-2 top-1/2 -translate-y-1/2 bg-emerald-100 text-emerald-600 p-2 rounded-full hover:bg-emerald-200 transition"
                title="Copy to clipboard"
              >
                <i class="fa-solid fa-copy"></i>
              </button>
            </div>
          </div>
        </div>

        <div v-if="currentTab === 'nearby'" class="bg-gray-100 p-6 rounded-2xl shadow-inner">
          <h2 class="text-xl font-bold text-emerald-700 mb-4 flex items-center">
            <i class="fa-solid fa-magnifying-glass-location mr-2"></i> Nearby Suggestions
          </h2>
          <p class="text-gray-600 text-sm mb-4">
            {{ tripPlan.days[0]?.locations[selectedLocationIndex]?.name || "จุดเริ่มต้นของทริป" }}
          </p>
           <!-- เลือกวัน -->
          <select v-model="selectedDay">
            <option v-for="(day, i) in tripPlan.days" :key="i" :value="i">
              Day {{ i + 1 }} - {{ day.title }}
            </option>
          </select>

          <!-- เลือกสถานที่ในวันนั้น -->
          <select v-model="selectedLocationIndex">
            <option
              v-for="(loc, j) in tripPlan.days[selectedDay]?.locations"
              :key="j"
              :value="j"
            >
              {{ loc.name }}
            </option>
          </select>

          <ul v-if="nearbyPlaces.length > 0" class="mt-4 space-y-3">
            <li
              v-for="place in nearbyPlaces"
              :key="place.name"
              class="p-4 bg-white rounded-xl shadow border border-gray-200 flex justify-between items-center hover:bg-gray-50 transition"
            >
              <div>
                <span class="font-medium text-gray-800 flex items-center">
                    <i class="fa-solid fa-location-dot text-emerald-400 mr-2"></i> {{ place.name }}
                </span>
                <span class="text-sm text-gray-500">⭐ {{ place.rating || 'N/A' }}</span>
              </div>
              <button
                class="text-sm bg-emerald-100 text-emerald-600 font-semibold px-3 py-1 rounded-full hover:bg-emerald-200 transition"
                @click="addToPlan(place)"
              >
                ➕ Add
              </button>
            </li>
          </ul>

          <p v-else class="text-gray-500 mt-4 text-center p-6">
            <i class="fa-solid fa-binoculars mr-2"></i> ไม่พบสถานที่ใกล้เคียงในบริเวณนี้
          </p>
        </div>
      </div>

      <div class="flex-1 w-full h-screen">
        <Tripmap :locations="allLocations" />
      </div>
    </div>

    <div v-else class="flex-1 flex justify-center items-center text-gray-500 bg-white">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-4 border-t-sky-500 border-sky-200 mb-4 mx-auto"></div>
        <p class="text-lg">กำลังโหลดแผนการเดินทาง...</p>
      </div>
    </div>
    
    <div v-if="loadError" class="fixed inset-0 flex items-center justify-center z-50 bg-gray-900 bg-opacity-50">
      <div class="bg-white p-8 rounded-lg shadow-xl text-center">
        <h2 class="text-2xl font-bold text-red-600 mb-4">
          <i class="fa-solid fa-triangle-exclamation mr-2"></i> {{ title }}
        </h2>
        <p class="text-gray-700">{{ message }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/*
  Font from CDN, add this to your main HTML file if not already included
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Kanit:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  You may also need to add fontawesome if you use the icons:
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
*/
.font-kanit {
  font-family: 'Kanit', sans-serif;
}
</style>