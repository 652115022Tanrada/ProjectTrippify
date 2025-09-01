<script setup>
import { ref, onMounted } from "vue";
import axios from "axios";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { thaiProvinces } from "../assets/provinces";
import Swal from "sweetalert2";
import Header from "./Header.vue";

const store = useStore();
const router = useRouter();
// const showLoginModal = ref(false);
const user = ref(null);
const today = new Date().toISOString().split("T")[0];
const trip_type = ref('solo')
const from = ref("");
const to = ref("");
const startDate = ref("");
const endDate = ref("");
const budget = ref("");
const currency = ref("THB");
const tripName = ref("");
const isLoading = ref(false);

const travelPreferences = ref([]);
const travelStyles = [
  "Temple Hopper",
  "Cafe",
  "Photo Spot Seeker",
  "Foodie",
  "Adventure",
  "Nature",
  "Beach",
  "Family",
  "Content Creator",
];

const submitTrip = async () => {
  if (!validateForm()) return;

  const payload = {
    userId: user.value.user_id,
    tripName: tripName.value,
    from: from.value,
    to: to.value,
    startDate: startDate.value,
    endDate: endDate.value,
    budget: budget.value,
    currency: currency.value,
    preferences: travelPreferences.value,
    trip_type: trip_type.value,
  };

  try {
    isLoading.value = true; // เริ่มโหลด
    const res = await axios.post("http://localhost:5000/api/trip", payload);
    console.log("Trip submitted:", res.data);
    store.commit("trip/setTripPlan", res.data);

    // ดีเล็กน้อยให้ overlay ขึ้นชัดเจน
    setTimeout(() => {
      router.push("/tripdetail");
    }, 500);
  } catch (err) {
    console.error("Error submitting trip:", err);
    Swal.fire({
      icon: "error",
      title: "Submission Failed",
      text: "Something went wrong while submitting your trip. Please try again.",
      confirmButtonText: "OK",
      confirmButtonColor: "#0ea5e9",
    });
  } finally {
    isLoading.value = false; // ปิดโหลดไม่ว่า success หรือ error
  }
};

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

const validateForm = () => {
  if (
    !tripName.value ||
    !from.value ||
    !to.value ||
    !startDate.value ||
    !endDate.value ||
    !budget.value 
    // !trip_type.value
  ) {
    Swal.fire({
      icon: "warning",
      title: "Incomplete Information",
      text: "Please fill out all required fields before starting your trip plan.",
      confirmButtonText: "OK",
      confirmButtonColor: "#0ea5e9",
    });
    return false;
  }

  if (from.value === to.value) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Route",
      text: "Origin and destination cannot be the same.",
      confirmButtonText: "OK",
      confirmButtonColor: "#0ea5e9",
    });
    return false;
  }

  if (new Date(startDate.value) > new Date(endDate.value)) {
    Swal.fire({
      icon: "warning",
      title: "Invalid Dates",
      text: "Start date cannot be later than end date.",
      confirmButtonText: "OK",
      confirmButtonColor: "#0ea5e9",
    });
    return false;
  }

  return true;
};

onMounted(getUser);
onMounted(() => {
  const script = document.createElement("script");
  script.src = "https://cdn.jsdelivr.net/npm/litepicker/dist/bundle.js";
  script.onload = () => {
    const css = document.createElement("link");
    css.rel = "stylesheet";
    css.href =
      "https://cdn.jsdelivr.net/npm/litepicker/dist/css/litepicker.css";
    document.head.appendChild(css);

    new window.Litepicker({
      element: document.getElementById("dateRange"),
      singleMode: false,
      numberOfMonths: 2,
      numberOfColumns: 2,
      autoApply: true,
      format: "YYYY-MM-DD",
      minDate: new Date(),
      setup: (picker) => {
        picker.on("selected", (start, end) => {
          startDate.value = start.format("YYYY-MM-DD");
          endDate.value = end.format("YYYY-MM-DD");
        });
      },
    });
  };
  document.body.appendChild(script);
});
</script>

<template>
  <div class="min-h-screen flex flex-col bg-[#0D1282]">
    <Header :user="user" @update:user="user = $event" />
    <h2
      class="text-3xl font-extrabold text-center mb-10 font-kanit mt-10 text-white"
    >
      SMART TRIP PLANNER
    </h2>

    <div
      class="w-full max-w-4xl mx-auto bg-[#EEEDED] rounded-2xl shadow-lg p-10"
    >
      <div class="w-full space-y-6">
        <div class="relative bg-white p-4 rounded-xl shadow-sm">
          <p class="text-sm font-light text-gray-500 font-kanit">TRIP NAME</p>
          <input
            v-model="tripName"
            type="text"
            placeholder="e.g. Bangkok Adventure"
            class="w-full border-0 bg-white text-xl shadow-none outline-none font-bold font-kanit mt-1 text-[#0D1282]"
          />
        </div>

        <!-- <div
          v-if="travelType === 'group'"
          class="w-full relative bg-white p-4 rounded-xl shadow-sm mt-4"
        >
          <p class="text-sm font-light text-gray-500 font-kanit">GROUP SIZE</p>
          <input
            type="number"
            v-model="groupSize"
            min="1"
            placeholder="Number of people"
            class="w-full border-0 bg-white text-xl shadow-none outline-none font-bold font-kanit mt-1 text-[#0D1282]"
          />
        </div> -->

        <div class="flex flex-col sm:flex-row gap-2 relative items-center">
          <div class="w-full relative bg-white p-4 rounded-xl shadow-sm">
            <p class="text-sm font-light text-gray-500 font-kanit">FROM</p>
            <select
              v-model="from"
              class="w-full border-0 bg-white text-2xl shadow-none outline-none font-bold font-kanit mt-1"
            >
              <option disabled value="">Select Province</option>
              <option
                v-for="province in thaiProvinces"
                :key="province"
                :value="province"
              >
                {{ province }}
              </option>
            </select>
          </div>

          <button
            @click="[from, to] = [to, from]"
            class="w-10 h-10 flex-none rounded-full bg-[#0D1282] text-white flex items-center justify-center -rotate-90 sm:rotate-0 hover:bg-[#F0DE36] hover:text-[#0D1282] transition duration-300"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="size-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
          </button>

          <div class="w-full relative bg-white p-4 rounded-xl shadow-sm">
            <p class="text-sm font-light text-gray-500 font-kanit">TO</p>
            <select
              v-model="to"
              class="w-full border-0 bg-white text-2xl shadow-none outline-none font-bold font-kanit mt-1"
            >
              <option disabled value="">Select Province</option>
              <option
                v-for="province in thaiProvinces"
                :key="province"
                :value="province"
              >
                {{ province }}
              </option>
            </select>
          </div>
        </div>

        <div class="flex flex-col sm:flex-row gap-4">
          <div class="w-full relative bg-white p-4 rounded-xl shadow-sm">
            <p class="text-sm font-light text-gray-500 font-kanit">
              DEPARTURE - RETURN
            </p>
            <input
              id="dateRange"
              type="text"
              placeholder="Select date range"
              class="w-full border-0 bg-white text-2xl shadow-none outline-none font-bold font-kanit mt-1 text-[#0D1282]"
            />
          </div>

          <div class="w-full relative bg-white p-4 rounded-xl shadow-sm">
            <p class="text-sm font-light text-gray-500 font-kanit">BUDGET</p>
            <input
              v-model="budget"
              type="number"
              min="0"
              placeholder="Enter budget"
              class="w-full border-0 bg-white text-2xl shadow-none outline-none font-bold font-kanit mt-1 text-[#0D1282]"
            />
            <select
              v-model="currency"
              class="absolute right-3 top-1/2 translate-y-2 bg-transparent text-sm text-[#0D1282] outline-none font-semibold font-kanit"
            >
              <option value="THB">THB</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <h3 class="font-semibold mb-5 font-mitr text-[#0D1282] pt-4">
          Choose Your Travel Style:
        </h3>
        <div class="w-full flex overflow-x-auto gap-4 py-2 custom-scrollbar">
          <label
            v-for="style in travelStyles"
            :key="style"
            class="relative flex-none flex flex-col items-center justify-center text-center p-2 cursor-pointer transition-all duration-200"
          >
            <input
              type="checkbox"
              :value="style"
              v-model="travelPreferences"
              class="appearance-none absolute inset-0 opacity-0 cursor-pointer"
            />
            <div
              class="flex items-center justify-center h-14 w-14 mb-1 rounded-full transition-all duration-200"
              :class="{
                'bg-[#F0DE36] text-[#0D1282]':
                  travelPreferences.includes(style),
                'bg-gray-200 text-gray-500': !travelPreferences.includes(style),
              }"
            >
              <img
                v-if="style === 'Temple Hopper'"
                src="/temple.png"
                alt="Tag icon"
                class="size-7"
              />
              <img
                v-else-if="style === 'Cafe'"
                src="/cafe.png"
                alt="Tag icon"
                class="size-7"
              />
              <img
                v-else-if="style === 'Photo Spot Seeker'"
                src="/camera.png"
                alt="Tag icon"
                class="size-7"
              />
              <img
                v-else-if="style === 'Foodie'"
                src="/food.png"
                alt="Tag icon"
                class="size-7"
              />
              <img
                v-else-if="style === 'Adventure'"
                src="/hiking.png"
                alt="Tag icon"
                class="size-7"
              />
              <img
                v-else-if="style === 'Nature'"
                src="/nature.png"
                alt="Tag icon"
                class="size-7"
              />
              <img
                v-else-if="style === 'Beach'"
                src="/beach.png"
                alt="Tag icon"
                class="size-7"
              />
              <img
                v-else-if="style === 'Family'"
                src="/family.png"
                alt="Tag icon"
                class="size-7"
              />
              <img
                v-else-if="style === 'Content Creator'"
                src="/slate.png"
                alt="Tag icon"
                class="size-7"
              />
              <svg
                v-else
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-7"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M12 6v12m-3-2.818.879.659c1.171.879 3.07.879 4.242 0 1.172-.879 1.172-2.303 0-3.182C13.536 12.219 12.768 12 12 12c-.725 0-1.45-.22-2.003-.659-1.106-.879-1.106-2.303 0-3.182s2.9-.879 4.006 0l.415.33M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
            <span
              class="font-semibold font-kanit text-xs transition-all duration-200"
              :class="{
                'text-[#D71313]': travelPreferences.includes(style),
                'text-gray-500': !travelPreferences.includes(style),
              }"
            >
              {{ style }}
            </span>
          </label>
        </div>
        <div class="text-center pt-4">
          <button
            @click="submitTrip"
            class="bg-[#0D1282] text-white px-6 py-3 rounded-full font-semibold hover:bg-[#F0DE36] hover:text-[#0D1282] transition font-kanit"
          >
            Start Planning
          </button>
        </div>
      </div>
      </div>
    </div>
    <!-- Loading Overlay with Logo -->
    <div
      v-if="isLoading"
      class="fixed inset-0 flex items-center justify-center z-50 backdrop-blur-md pointer-events-none"
    >
      <div class="flex flex-col items-center gap-4">
        <!-- Logo กระดึ๊บขึ้นลง -->
        <img src="/1.png" alt="Loading Logo" class="w-24 h-24 bounce" />
        <p class="text-[#000000] font-bold text-lg animate-pulse">
          Creating your trip...
        </p>
      </div>
    </div>

</template>
<style scoped>
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
.bounce {
  animation: bounce 1s ease-in-out infinite;
}
</style>

