<script setup>
import { computed, watch } from 'vue'
import { useStore } from 'vuex'
import Tripmap from './Tripmap.vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import draggable from 'vuedraggable'
import Swal from 'sweetalert2'

const store = useStore()
const tripPlan = computed(() => store.state.trip.tripPlan)
const router = useRouter()
const transportInfo = computed(() => tripPlan.value?.transport_info || null)

watch(() => tripPlan.value, (newVal) => {
  store.commit('trip/updateTripPlan', newVal)
}, { deep: true });

const saveTrip = async () => {
  try {
    if (!tripPlan.value) return

    const response = await axios.post('http://localhost:5000/api/trips/save', tripPlan.value)

    Swal.fire({
      icon: 'success',
      title: 'Trip saved successfully!',
      text: 'Your travel plan has been saved 😊',
      timer: 2000,
      showConfirmButton: false
    })

    console.log('Response:', response.data)
  } catch (error) {
    console.error('Error saving trip:', error)
    Swal.fire({
      icon: 'error',
      title: 'Oops!',
      text: 'There was a problem saving your trip.',
    })
  }
}

const cancelTrip = () => {
  Swal.fire({
    title: 'Cancel this trip?',
    text: 'Are you sure you want to cancel and discard your trip plan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e53e3e',
    cancelButtonColor: '#a0aec0',
    confirmButtonText: 'Yes, cancel it',
    cancelButtonText: 'No, keep it'
  }).then((result) => {
    if (result.isConfirmed) {
      store.commit('trip/clearTripPlan')
      router.push('/')

      Swal.fire({
        icon: 'info',
        title: 'Trip cancelled',
        text: 'Your trip plan has been discarded.',
        timer: 1500,
        showConfirmButton: false
      })
    }
  })
}

// ฟังก์ชันลบสถานที่จากวันนั้น ๆ
const removeLocation = (dayIndex, locIndex) => {
  Swal.fire({
    title: 'Are you sure?',
    text: 'Do you really want to remove this location from your trip plan?',
    icon: 'warning',
    showCancelButton: true,
    confirmButtonColor: '#e53e3e',
    cancelButtonColor: '#a0aec0',
    confirmButtonText: 'Yes, remove it!',
    cancelButtonText: 'Cancel'
  }).then((result) => {
    if (result.isConfirmed) {
      tripPlan.value.trip_plan[dayIndex].locations.splice(locIndex, 1)
      //คำนวณค่าใช้จ่ายหลังลบ
      recalculateCosts()
      store.commit('trip/updateTripPlan', tripPlan.value)

      Swal.fire({
        title: 'Removed!',
        text: 'The location has been removed from your trip plan.',
        icon: 'success',
        timer: 1500,
        showConfirmButton: false
      })
    }
  })
}

const recalculateCosts = () => {
  let totalTripCost = 0

  tripPlan.value.trip_plan.forEach((day) => {
    let dayCost = 0

    if (day.locations && day.locations.length > 0) {
      day.locations.forEach((loc) => {
        const cost = parseFloat(loc.estimated_cost) || 0
        dayCost += cost
      })
    }

    day.total_day_cost = dayCost
    totalTripCost += dayCost
  })

  tripPlan.value.total_trip_cost = totalTripCost
}

const allLocations = computed(() => {
  return tripPlan.value?.days?.flatMap(day => day.locations || []) || []
});
</script>

<template>
  <div v-if="tripPlan" class="flex h-screen overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <div class="w-[50%] p-6 overflow-y-auto bg-white shadow-2xl rounded-r-3xl">
      <h1 class="text-3xl font-extrabold text-sky-500 mb-6 tracking-tight">
        {{ tripPlan.trip_name }}
      </h1>

      <!-- Travel Summary Table -->
      <div class="mb-10 bg-sky-50 p-5 rounded-xl shadow">
        <h2 class="text-xl font-semibold text-sky-700 mb-4">
          🚍 Transportation Methods
        </h2>

        <!-- Table Header -->
        <div class="grid grid-cols-5 gap-2 px-4 py-3 bg-sky-100 text-sky-900 font-semibold text-sm rounded-t-lg border border-sky-300">
          <div></div>
          <div class="text-center">Car 🚗</div>
          <div class="text-center">Bus 🚌</div>
          <div class="text-center">Train 🚆</div>
          <div class="text-center">Flight ✈️</div>
        </div>

        <!-- Table Body -->
        <div class="grid grid-cols-5 gap-2 px-4 py-3 bg-white text-gray-700 text-sm border-b border-gray-200 items-center">
          <div class="font-medium">Distance</div>
          <div class="text-center">{{ transportInfo.car?.distance || '-' }}</div>
          <div class="text-center">{{ transportInfo.bus?.distance || '-' }}</div>
          <div class="text-center">{{ transportInfo.train?.distance || '-' }}</div>
          <div class="text-center">{{ transportInfo.flight?.distance || '-' }}</div>
        </div>

        <div class="grid grid-cols-5 gap-2 px-4 py-3 bg-white text-gray-700 text-sm border-b border-gray-200 items-center rounded-b-lg">
          <div class="font-medium">Duration</div>
          <div class="text-center">{{ transportInfo.car?.duration || '-' }}</div>
          <div class="text-center">{{ transportInfo.bus?.duration || '-' }}</div>
          <div class="text-center">{{ transportInfo.train?.duration || '-' }}</div>
          <div class="text-center">{{ transportInfo.flight?.duration || '-' }}</div>
        </div>
      </div>


      <div
        v-for="(day, index) in tripPlan.days"
        :key="index"
        class="mb-10 bg-sky-50 p-5 rounded-xl shadow"
      >
        <h2 class="text-xl font-semibold text-sky-700 mb-2">
          📅 Day {{ index + 1 }}: {{ day.title }} ({{ day.date }})
        </h2>
        <p class="text-gray-700 mb-4 text-sm italic">
          {{ day.description || day.narrative || 'No description.' }}
        </p>

        <!-- Table Header -->
        <div
          class="grid grid-cols-7 gap-2 px-4 py-3 bg-sky-100 text-sky-900 font-semibold text-sm rounded-t-lg border border-sky-300"
        >
          <div class="col-span-2">Destination</div>
          <div class="text-center">Category</div>
          <div class="text-center">Transport</div>
          <div class="text-center">Expense</div>
          <div class="text-center">Distance</div>
          <div class="text-center"></div>
        </div>

        <!-- Table Body -->
        <draggable
          v-model="day.locations"
          :group="'locations'"
          item-key="name"
          class="space-y-2"
          @change="recalculateCosts"
        >
          <template #item="{ element: loc, index: i }">
            <div
              class="grid grid-cols-7 gap-2 px-4 py-3 bg-white border-b border-gray-200 text-sm items-center hover:bg-sky-50 transition rounded"
            >
              <div class="col-span-2 font-medium text-green-800">{{ loc.name }}</div>
              <div class="text-center text-gray-700">{{ loc.category || 'N/A' }}</div>
              <div class="text-center text-gray-700">{{ loc.transport || 'N/A' }}</div>
              <div class="text-center text-gray-700">
                {{ loc.estimated_cost || 0 }} {{ loc.currency || tripPlan.currency || 'THB' }}
              </div>
              <div class="text-center text-gray-700">{{ loc.distance_to_next || 'N/A' }}</div>
              <div class="text-center">
                <button
                  @click="removeLocation(index, i)"
                  class="text-red-500 hover:text-red-700 font-bold"
                  title="Delete location"
                >
                  ❌
                </button>
              </div>
            </div>
          </template>
        </draggable>

        <!-- Tips & Day Total -->
        <div class="mt-4 text-sm text-gray-700">
          <p v-if="day.daily_tips && day.daily_tips.length > 0" class="mb-1">
            💡 <span class="font-medium">Tips:</span> {{ day.daily_tips.join(', ') }}
          </p>
          <p class="font-semibold text-right text-sky-700">
            💰 Day Total: {{ day.total_day_cost || 0 }} {{ tripPlan.currency || 'THB' }}
          </p>
        </div>
      </div>

      <!-- Total Trip Cost -->
      <div class="text-right mt-6 text-lg font-bold text-green-700 border-t pt-4">
        🧾 Total Trip Cost: {{ tripPlan.total_trip_cost || 0 }} {{ tripPlan.currency || 'THB' }}
      </div>

      <!-- Buttons -->
      <div class="mt-6 flex justify-end gap-4">
        <button
          @click="cancelTrip"
          class="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition"
        >
          ❌ ยกเลิก
        </button>
        <button
          @click="saveTrip"
          class="bg-sky-500 hover:bg-sky-600 text-white font-semibold py-2 px-4 rounded-xl shadow-md transition"
        >
          💾 บันทึกรายการเที่ยว
        </button>
      </div>
    </div>

    <!-- Map Area -->
    <div class="w-[60%] h-screen">
      <Tripmap :locations="allLocations" />
    </div>
  </div>

  <div v-else class="h-screen flex justify-center items-center text-gray-500">
    <p>Loading trip plan...</p>
  </div>
</template>
