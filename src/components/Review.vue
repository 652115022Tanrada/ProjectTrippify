<script setup>
import { ref, onMounted, computed } from "vue"
import { useRoute } from "vue-router"
import axios from "axios"
import Swal from "sweetalert2"
import Header from "./Header.vue"
import draggable from "vuedraggable"

const route = useRoute()
const user = ref(null)
const tripId = route.params.tripId
const tripPlan = ref(null)
const tripName = computed(() => tripPlan.value?.trip_name || "My Trip")

const reviews = ref([]) // เก็บรีวิวใน state
const loading = ref(false)
const error = ref(null)

const submitting = ref(false)
const showEditControls = ref(false) // สำหรับ draggable
const newReviewName = ref("")
// const newReviewEmail = ref("")
const newReviewComment = ref("")
const newReviewRating = ref(0) // ⭐ เก็บค่าดาว
const hoverRating = ref(0)
const expandedDays = ref({}) // เก็บสถานะ dropdown ของแต่ละ day
const allExpanded = ref(false) // สถานะ Expand/Collapse All

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

// โหลดแผนทริปจาก backend ได้ตามปกติ
const fetchTripPlan = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/trip/${tripId}`, { withCredentials: true })
    tripPlan.value = res.data
  } catch (err) {
    error.value = err.response?.data?.message || "ไม่สามารถโหลดทริปได้"
  }
}
const fetchReviews = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/reviews/${tripId}`);
    reviews.value = res.data;
  } catch (err) {
    console.error("โหลดรีวิวล้มเหลว:", err);
  }
};
// toggle แต่ละวัน
const toggleDay = (index) => {
  expandedDays.value[index] = !expandedDays.value[index]
}

// toggle ทุกวัน
const toggleAllDays = () => {
  allExpanded.value = !allExpanded.value
  tripPlan.value?.days.forEach((_, index) => {
    expandedDays.value[index] = allExpanded.value
  })
}

const averageRating = computed(() => {
  if (reviews.value.length === 0) return 0
  const sum = reviews.value.reduce((acc, r) => acc + (r.rating || 0), 0)
  return (sum / reviews.value.length).toFixed(1)
})

const getRatingPercentage = (rating) => {
  if (reviews.value.length === 0) return "0%"
  const count = reviews.value.filter(r => r.rating === rating).length
  return Math.round((count / reviews.value.length) * 100) + "%"
}

// ✅ ส่งรีวิวใหม่ (เก็บใน state อย่างเดียว ไม่เรียก backend)
const submitReview = async () => {
  if (!newReviewRating.value) {
    Swal.fire({
      icon: "warning",
      title: "กรุณาให้คะแนนดาว",
      text: "คุณต้องเลือกอย่างน้อย 1 ดาวก่อนส่งรีวิว"
    });
    return;
  }
  if (!newReviewComment.value.trim()) {
    Swal.fire({
      icon: "warning",
      title: "กรุณาใส่ความคิดเห็น",
      text: "อย่าลืมเขียนคอมเมนต์รีวิวก่อนส่ง"
    });
    return;
  }

  submitting.value = true;

  try {
    const res = await axios.post(`http://localhost:5000/api/reviews/${tripId}`, {
      user_name: newReviewName.value || "Anonymous User",
      rating: newReviewRating.value,
      comment: newReviewComment.value
    });

    reviews.value.unshift(res.data);

    newReviewName.value = "";
    // newReviewEmail.value = "";
    newReviewComment.value = "";
    newReviewRating.value = 0;

    Swal.fire({
      icon: "success",
      title: "ส่งรีวิวสำเร็จ",
      timer: 1500,
      showConfirmButton: false
    });
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "ส่งรีวิวไม่สำเร็จ",
      text: err.response?.data?.error || "ลองใหม่อีกครั้ง"
    });
  } finally {
    submitting.value = false;
  }
};


const formatDate = (dateStr) =>
  new Date(dateStr).toLocaleDateString("th-TH", {
    year: "numeric",
    month: "long",
    day: "numeric"
  })

onMounted(() => {
  getUser()
  fetchTripPlan()
  fetchReviews();
})
</script>

<template>
  <div class="min-h-screen bg-[#0D1282]">
    <Header :user="user" @update:user="user = $event" />

    <div class="max-w-5xl mx-auto py-10 px-4 space-y-8">
      <div v-if="tripPlan">
        <h1 class="text-2xl font-bold text-white mb-6">
          {{ tripName || "Unnamed Trip" }}
        </h1>
        <!-- Trip Days Expand/Collapse All -->
        <div class="flex justify-end mb-4">
          <button @click="toggleAllDays"
            class="bg-[#F0DE36] text-[#0D1282] font-semibold px-4 py-2 rounded-lg hover:bg-yellow-400 transition">
            {{ allExpanded ? 'Collapse All' : 'Expand All' }}
          </button>
        </div>
        <div v-for="(day, index) in tripPlan.days" :key="index"
          class="mb-4 bg-white/95 rounded-2xl shadow-lg border border-[#EEEDED]">
          <button @click="toggleDay(index)"
            class="w-full px-6 py-4 text-left flex justify-between items-center text-xl font-bold text-[#0D1282] rounded-t-2xl">
            <span>
              <span
                class="bg-[#D71313] text-white text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full mr-2">
                {{ index + 1 }}
              </span>
              Day {{ index + 1 }}: {{ day.title }}
            </span>
            <span>
              <i :class="expandedDays[index] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </span>
          </button>

          <div v-show="expandedDays[index]" class="px-6 py-4 border-t border-gray-200 text-sm text-gray-70">
            <p class="text-gray-500">{{ day.date }}</p>
            <p>{{ day.description || day.narrative || "No description." }}</p>

            <div
              class="grid grid-cols-7 gap-2 px-4 py-3 bg-[#F0DE36] text-[#0D1282] font-semibold text-sm rounded-t-lg">
              <div class="col-span-2">Destination</div>
              <div class="text-center">Category</div>
              <div class="text-center">Transport</div>
              <div class="text-center">Expense</div>
              <div class="text-center">Distance</div>
              <div class="text-center"></div>
            </div>

            <draggable v-model="day.locations" :group="'locations'" item-key="name" :disabled="!showEditControls">
              <template #item="{ element: loc, index: i }">
                <div
                  class="grid grid-cols-7 gap-2 px-4 py-3 bg-white border-b border-gray-200 text-sm items-center hover:bg-[#EEEDED] transition rounded-md shadow-sm cursor-grab">
                  <div class="col-span-2 font-medium text-gray-800">
                    <i class="fa-solid fa-map-pin text-[#0D1282] mr-2"></i>
                    {{ loc.name }}
                  </div>
                  <div class="text-center text-gray-600">{{ loc.category || "N/A" }}</div>
                  <div class="text-center text-gray-600">{{ loc.transport || "N/A" }}</div>
                  <div class="text-center text-[#D71313] font-medium">
                    {{ loc.estimated_cost || 0 }} {{ loc.currency || tripPlan.currency || "THB" }}
                  </div>
                  <div class="text-center text-gray-600">{{ loc.distance_to_next || "N/A" }}</div>
                  <div class="text-center" v-if="showEditControls">
                    <button @click="day.locations.splice(i, 1)" class="text-red-500 hover:text-red-700">ลบ</button>
                  </div>
                </div>
              </template>
            </draggable>
          </div>
        </div>
      </div>
      <!-- Trip Reviews -->
      <div>
        <h2 class="text-2xl font-bold text-white mb-4">Trip Reviews</h2>
        <div v-if="error" class="text-red-500">{{ error }}</div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">

          <!-- Average Rating -->
          <div class="bg-white p-6 rounded-xl shadow-md border border-[#EEEDED]">
            <h3 class="text-lg font-semibold mb-4 text-[#0D1282]">Average Rating</h3>
            <div class="flex items-center mb-4">
              <span class="text-4xl font-bold text-[#D71313]">{{ averageRating }}</span>
              <div class="ml-3 flex">
                <i v-for="i in 5" :key="i" class="fa-star"
                  :class="i <= Math.round(averageRating) ? 'fas text-[#F0DE36]' : 'far text-gray-300'"></i>
              </div>
            </div>
            <div v-for="n in 5" :key="n" class="flex items-center text-sm mb-2">
              <span class="w-6 font-medium text-gray-700">{{ 6 - n }}</span>
              <div class="flex-1 mx-2 bg-gray-200 rounded-full h-2">
                <div class="bg-[#F0DE36] h-2 rounded-full transition-all duration-500 ease-out"
                  :style="{ width: getRatingPercentage(6 - n) }"></div>
              </div>
              <span class="w-10 text-right font-medium text-[#0D1282]">{{ getRatingPercentage(6 - n) }}</span>
            </div>
          </div>

          <!-- Customer Comments -->
          <div class="bg-white p-6 rounded-xl shadow-md border border-[#EEEDED]">
            <h3 class="text-lg font-semibold mb-4 text-[#0D1282]">Customer Comments</h3>
            <div v-if="reviews.length > 0" class="space-y-4 max-h-96 overflow-y-auto pr-2">
              <div v-for="review in reviews" :key="review.id"
                class="bg-gray-50 p-4 rounded-xl shadow-sm border border-[#EEEDED] hover:bg-gray-100 transition-colors">
                <div class="flex items-center mb-2">
                  <div
                    class="w-8 h-8 rounded-full bg-[#0D1282] flex items-center justify-center text-white font-bold text-sm mr-3">
                    {{ review.user_name ? review.user_name.charAt(0) : 'A' }}
                  </div>
                  <h4 class="font-semibold text-gray-800">{{ review.user_name || 'Anonymous User' }}</h4>

                </div>
                <div class="flex mb-2">
                  <i v-for="i in 5" :key="i" class="fa-star"
                    :class="i <= review.rating ? 'fas text-[#F0DE36]' : 'far text-gray-300'"></i>
                </div>
                <p class="text-gray-700 text-sm">{{ review.comment }}</p>
                <span class="block mt-2 text-right text-xs text-gray-500">{{ formatDate(review.createdAt) }}</span>
              </div>
            </div>
            <div v-else class="text-gray-500 text-center">No reviews yet for this trip</div>
          </div>
        </div>

        <!-- Write a Review -->
        <div class="bg-white p-6 rounded-xl shadow-md border border-[#EEEDED]">
          <h3 class="text-xl font-bold mb-4 text-[#0D1282] text-center">Write Your Review</h3>
          <p class="text-center text-gray-600 mb-6">You can rate and share your travel experience</p>

          <!-- Star Rating -->
          <div class="flex items-center justify-center mb-6">
            <span class="text-lg mr-3 font-semibold text-gray-700">Rating :</span>
            <div class="flex space-x-1">
              <i v-for="i in 5" :key="i" class="fa-star cursor-pointer text-3xl transition-colors duration-200"
                :class="i <= (hoverRating || newReviewRating) ? 'fas text-[#F0DE36]' : 'far text-gray-300'"
                @mouseover="hoverRating = i" @mouseleave="hoverRating = 0" @click="newReviewRating = i"></i>
            </div>
          </div>

          <!-- Name & Email -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <input v-model="newReviewName" type="text" placeholder="Your Name (optional)"
              class="border border-[#EEEDED] rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#F0DE36] transition" />
            <!-- <input v-model="newReviewEmail" type="email" placeholder="Your Email (not displayed)"
              class="border border-[#EEEDED] rounded-lg px-4 py-3 w-full focus:outline-none focus:ring-2 focus:ring-[#F0DE36] transition" /> -->
          </div>

          <!-- Comment -->
          <textarea v-model="newReviewComment" placeholder="Write your review here..."
            class="w-full h-32 border border-[#EEEDED] rounded-lg p-4 text-gray-700 focus:ring-2 focus:ring-[#F0DE36] outline-none mb-6 transition" />

          <!-- Submit -->
          <button @click="submitReview" :disabled="submitting"
            class="w-full bg-[#D71313] text-white font-bold text-lg py-3 rounded-lg hover:bg-[#B70F11] disabled:opacity-50 transition-colors transform hover:scale-105">
            {{ submitting ? "Submitting..." : "Submit Review" }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
textarea {
  resize: none;
}
</style>
