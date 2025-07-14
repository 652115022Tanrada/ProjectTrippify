<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import axios from 'axios'
import Swal from 'sweetalert2'
import Tripmap from './Tripmap.vue'
import draggable from 'vuedraggable'
import ErrorArea from '../error/ErrorArea.vue'
const route = useRoute()
const router = useRouter()
const tripId = route.params.tripId
const loadError = ref(null)

const tripPlan = ref(null)
const user = ref(null)

const getUser = async () => {
  try {
    const res = await axios.get('http://localhost:5000/auth/user', {
      withCredentials: true,
    })
    user.value = res.data
    return true
  } catch {
    return false
  }
}
const fetchTrip = async () => {
  try {
    const res = await axios.get(`http://localhost:5000/api/trip/${tripId}`, {
      withCredentials: true,
    })
    tripPlan.value = res.data
  } catch (err) {
    console.error('Error loading trip:', err)

    if (err.response?.status === 404) {
      loadError.value = {
        title: 'Trip Not Found',
        message: 'The itinerary you are looking for does not exist.',
      }
    } else if (err.response?.status === 410) {
      loadError.value = {
        title: 'Trip Expired',
        message: 'This shared trip link has expired.',
      }
    } else {
      loadError.value = {
        title: 'Failed to Load Trip',
        message: 'There was a problem loading the trip. Please try again later.',
      }
    }
  }
}


onMounted(async () => {
  const loggedIn = await getUser()

  if (!loggedIn) {
    // ถ้าไม่ login → ให้ login
    Swal.fire({
      icon: 'warning',
      title: 'Please login to join this trip',
      text: 'You must be logged in to view and join this trip.',
      showCancelButton: true,
      confirmButtonText: 'Login with Google',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        window.location.href = 'http://localhost:5000/auth/google'
      } else {
        router.push('/')
      }
    })
    return
  }

  // ถ้า login แล้ว → พยายาม join trip
  try {
    await axios.post(`http://localhost:5000/api/trip/${tripId}/join`, {}, { withCredentials: true })
  } catch (err) {
    console.warn('Already joined or error:', err.response?.data || err)
    // ปล่อยให้ผ่านไปเลยถ้า join แล้ว
  }

  await fetchTrip() // โหลด trip มาโชว์
})

const transportInfo = computed(() => tripPlan.value?.transport_info || {})
const tripName = computed(() => tripPlan.value?.trip_name || 'Shared Trip')
const allLocations = computed(() =>
  tripPlan.value?.days?.flatMap(day => day.locations || []) || []
)
</script>

<template>
  <div v-if="tripPlan" class="flex h-screen overflow-hidden bg-gray-100">
    <!-- Sidebar -->
    <div class="w-[50%] p-6 overflow-y-auto bg-white shadow-2xl rounded-r-3xl">
      <h2 class="text-2xl font-extrabold text-sky-700 mb-4 font-kanit">{{ tripName }}</h2>

      <!-- Transport Summary -->
      <div v-if="transportInfo" class="mb-10 bg-sky-50 p-5 rounded-xl shadow">
        <h2 class="text-xl font-semibold text-sky-700 mb-4 font-kanit">🚍 Transportation Methods</h2>
        <div class="grid grid-cols-5 gap-2 px-4 py-3 bg-sky-100 font-kanit font-semibold text-sm text-sky-900 border border-sky-300 rounded-t-lg">
          <div></div>
          <div class="text-center">Car 🚗</div>
          <div class="text-center">Bus 🚌</div>
          <div class="text-center">Train 🚆</div>
          <div class="text-center">Flight ✈️</div>
        </div>
        <div class="grid grid-cols-5 gap-2 px-4 py-3 bg-white font-kanit text-sm border-b">
          <div class="font-medium">Distance</div>
          <div class="text-center">{{ transportInfo.car?.distance || '-' }}</div>
          <div class="text-center">{{ transportInfo.bus?.distance || '-' }}</div>
          <div class="text-center">{{ transportInfo.train?.distance || '-' }}</div>
          <div class="text-center">{{ transportInfo.flight?.distance || '-' }}</div>
        </div>
        <div class="grid grid-cols-5 gap-2 px-4 py-3 bg-white font-kanit text-sm border-b rounded-b-lg">
          <div class="font-medium">Duration</div>
          <div class="text-center">{{ transportInfo.car?.duration || '-' }}</div>
          <div class="text-center">{{ transportInfo.bus?.duration || '-' }}</div>
          <div class="text-center">{{ transportInfo.train?.duration || '-' }}</div>
          <div class="text-center">{{ transportInfo.flight?.duration || '-' }}</div>
        </div>
      </div>

      <!-- Daily Plan -->
      <div v-for="(day, index) in tripPlan.days" :key="index" class="mb-10 bg-sky-50 p-5 rounded-xl shadow">
        <h2 class="text-xl font-semibold text-sky-700 mb-2 font-kanit">
          📅 Day {{ index + 1 }}: {{ day.title }} ({{ day.date }})
        </h2>
        <p class="text-gray-700 mb-4 text-sm font-kanit">{{ day.description || day.narrative || 'No description.' }}</p>

        <!-- Locations Table -->
        <div class="grid grid-cols-7 gap-2 px-4 py-3 bg-sky-100 font-kanit font-semibold text-sm text-sky-900 border border-sky-300 rounded-t-lg">
          <div class="col-span-2">Destination</div>
          <div class="text-center">Category</div>
          <div class="text-center">Transport</div>
          <div class="text-center">Expense</div>
          <div class="text-center">Distance</div>
          <div></div>
        </div>

        <draggable :model-value="day.locations" :group="'locations'" item-key="name" class="space-y-2" :disabled="true">
          <template #item="{ element: loc }">
            <div class="grid grid-cols-7 gap-2 px-4 py-3 bg-white font-kanit text-sm border-b items-center hover:bg-sky-50 transition rounded">
              <div class="col-span-2 font-medium text-green-800">{{ loc.name }}</div>
              <div class="text-center text-gray-700">{{ loc.category || 'N/A' }}</div>
              <div class="text-center text-gray-700">{{ loc.transport || 'N/A' }}</div>
              <div class="text-center text-gray-700">
                {{ loc.estimated_cost || 0 }} {{ loc.currency || tripPlan.currency || 'THB' }}
              </div>
              <div class="text-center text-gray-700">{{ loc.distance_to_next || 'N/A' }}</div>
              <div></div>
            </div>
          </template>
        </draggable>

        <!-- Tips + Day Cost -->
        <div class="mt-4 text-sm text-gray-700 font-kanit">
          <p v-if="day.daily_tips?.length" class="mb-1">💡 <span class="font-medium">Tips:</span> {{ day.daily_tips.join(', ') }}</p>
          <p class="font-semibold text-right text-sky-700">💰 Day Total: {{ day.total_day_cost || 0 }} {{ tripPlan.currency || 'THB' }}</p>
        </div>
      </div>

      <!-- Total -->
      <div class="text-right mt-6 text-lg font-bold text-green-700 border-t pt-4 font-kanit">
        🧾 Total Trip Cost: {{ tripPlan.total_trip_cost || 0 }} {{ tripPlan.currency || 'THB' }}
      </div>
    </div>

    <!-- Map -->
    <div class="w-[60%] h-screen">
      <Tripmap :locations="allLocations" />
    </div>
  </div>

  <div v-if="loadError">
<ErrorArea
  v-if="loadError"
  title="Trip Not Found"
  message="This trip may have expired or does not exist." />
  </div>


  <div v-else class="h-screen flex justify-center items-center text-gray-500">
    <p>Loading trip plan...</p>
  </div>
</template>
