<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'
import Tripmap from './Tripmap.vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const store = useStore()
const tripPlan = computed(() => store.state.trip.tripPlan)
const router = useRouter()

const saveTrip = async () => {
  try {
    if (!tripPlan.value) return

    const response = await axios.post('http://localhost:5000/api/trips/save', tripPlan.value)

    alert('บันทึกรายการเที่ยวสำเร็จ!')
    console.log('Response:', response.data)
  } catch (error) {
    console.error('เกิดข้อผิดพลาดในการบันทึก:', error)
    alert('เกิดข้อผิดพลาดในการบันทึกรายการเที่ยว')
  }
}

const cancelTrip = () => {
  if (confirm('คุณต้องการยกเลิกรายการเที่ยวนี้หรือไม่?')) {
    store.commit('trip/clearTripPlan') // หรือกำหนด mutation สำหรับลบ tripPlan
    router.push('/') // หรือ redirect ไปหน้า home หรือหน้าอื่นตามต้องการ
  }
}
</script>

<template>
  <div v-if="tripPlan" class="flex h-screen overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <div class="w-[50%] p-6 overflow-y-auto bg-white shadow-2xl rounded-r-3xl">
      <h1 class="text-3xl font-extrabold text-sky-500 mb-6 tracking-tight">
        {{ tripPlan.trip_name }}
      </h1>

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
          class="grid grid-cols-6 gap-2 px-4 py-3 bg-sky-100 text-sky-900 font-semibold text-sm rounded-t-lg border border-sky-300"
        >
          <div class="col-span-2">Destination</div>
          <div class="text-center">Category</div>
          <div class="text-center">Transport</div>
          <div class="text-center">Expense</div>
          <div class="text-center">Distance</div>
        </div>

        <!-- Table Body -->
        <div
          v-for="(loc, i) in day.locations"
          :key="i"
          class="grid grid-cols-6 gap-2 px-4 py-3 bg-white border-b border-gray-200 text-sm items-center hover:bg-sky-50 transition rounded"
        >
          <div class="col-span-2 font-medium text-green-800">
            {{ loc.name }}
          </div>
          <div class="text-center text-gray-700">
            {{ loc.category || 'N/A' }}
          </div>
          <div class="text-center text-gray-700">
            {{ loc.transport || loc.transport_to_next || 'N/A' }}
          </div>
          <div class="text-center text-gray-700">
            {{ loc.estimated_cost || 0 }} {{ loc.currency || tripPlan.currency || 'THB' }}
          </div>
          <div class="text-center text-gray-700">
            {{ loc.distance_to_next || 'N/A' }}
          </div>
        </div>

        <!-- Tips & Day Total -->
        <div class="mt-4 text-sm text-gray-700">
          <p v-if="day.tips && day.tips.length > 0" class="mb-1">
            💡 <span class="font-medium">Tips:</span> {{ day.tips.join(', ') }}
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
      <Tripmap :locations="tripPlan.days.flatMap(day => day.locations || [])" />
    </div>
  </div>

  <div v-else class="h-screen flex justify-center items-center text-gray-500">
    <p>Loading trip plan...</p>
  </div>
</template>
