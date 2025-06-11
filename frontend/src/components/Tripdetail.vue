<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()
const tripPlan = computed(() => store.state.trip.tripPlan)
</script>

<template>
  <div v-if="tripPlan">
    <h1>{{ tripPlan.trip_name }}</h1>

    <div v-for="(day, index) in tripPlan.days" :key="index" class="day-plan">
      <h2>Day {{ index + 1 }}: {{ day.title }} ({{ day.date }})</h2>
      <p>{{ day.description || day.narrative }}</p>

      <ul>
        <li v-for="(loc, i) in day.locations" :key="i">
          🗺 {{ loc.time }} - {{ loc.name }} ({{ loc.category }}) - 
          {{ loc.estimated_cost }} {{ loc.currency }}
        </li>
      </ul>

      <p v-if="day.daily_tips">💡 Tips: {{ day.daily_tips.join(', ') }}</p>
      <p>💰 Total Cost: {{ day.total_day_cost || 0 }} {{ tripPlan.currency || tripPlan.budget_currency }}</p>
    </div>

    <h3>🧾 Total Trip Cost: {{ tripPlan.total_trip_cost }} {{ tripPlan.currency || tripPlan.budget_currency }}</h3>
  </div>

  <div v-else>
    <p>Loading trip plan...</p>
  </div>
</template>

