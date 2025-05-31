<script setup>
import { ref } from 'vue'

const travelType = ref(null)
</script>


<template>
    <div class="min-h-screen flex flex-col bg-gradient-to-b from-sky-100 via-white to-green-100 text-gray-800">
    <header class="w-full flex justify-between items-center py-6 px-8">
    <router-link to="/">
      <img src="/logo.png" alt="Logo" class="h-15 w-auto object-contain" />
    </router-link>
      <nav class="space-x-6 text-gray-800 font-medium">
      <router-link to="/" class="hover:text-sky-600">Home</router-link>
      <router-link to="/planner" class="hover:text-sky-600">Planner</router-link>
      <router-link to="/expense" class="hover:text-sky-600">Expense Tracker</router-link>
      <router-link to="/review" class="hover:text-sky-600">Trip Review</router-link>
      <router-link to="/login">
      <button class="ml-4 bg-sky-400 text-white px-4 py-2 rounded-full hover:bg-sky-600">
        Login
      </button>
      </router-link>
      </nav>
    </header>

    <!-- Title -->
    <h2 class="text-3xl font-extrabold text-center mb-10">SMART TRIP PLANNER</h2>

    <!-- Trip Form -->
    <div class="max-w-3xl mx-auto space-y-6">
      <!-- From - To -->
      <div class="flex flex-col md:flex-row gap-4 justify-center">
        <div class="flex items-center border p-3 rounded w-full">
          <span class="mr-2">📍</span>
          <input type="text" placeholder="From" class="w-full outline-none" />
        </div>
        <div class="flex items-center border p-3 rounded w-full">
          <span class="mr-2">📍</span>
          <input type="text" placeholder="To" class="w-full outline-none" />
        </div>
      </div>

      <!-- Dates -->
      <div class="flex flex-col md:flex-row gap-4 justify-center">
        <input type="date" class="border p-3 rounded w-full" placeholder="Start date" />
        <input type="date" class="border p-3 rounded w-full" placeholder="End date" />
      </div>

     <!-- Budget -->
      <div class="border p-3 rounded w-full text-left flex items-center space-x-2">
        <span class="text-gray-500">฿</span>
        <input
          type="number"
          min="0"
          placeholder="Budget Plan"
          class="w-full outline-none"
        />
      </div>


      <!-- Travel Type -->
      <div class="flex flex-col items-center gap-6">
      <!-- Travel Type -->
      <div class="flex flex-col md:flex-row justify-center gap-6 w-full max-w-xl">
      <!-- Solo travel -->
      <label
        class="flex items-center border p-3 rounded w-full md:w-1/2 cursor-pointer"
        :class="travelType === 'solo' ? 'border-blue-500 bg-blue-50' : ''"
      >
        <input
          type="radio"
          value="solo"
          v-model="travelType"
          class="mr-2"
        />
        🧍 Solo travel
      </label>

      <!-- Group travel -->
      <label
        class="flex items-center border p-3 rounded w-full md:w-1/2 cursor-pointer"
        :class="travelType === 'group' ? 'border-blue-500 bg-blue-50' : ''"
      >
        <input
          type="radio"
          value="group"
          v-model="travelType"
          class="mr-2"
        />
        👥 Group travel
        <input
          v-if="travelType === 'group'"
          type="number"
          min="1"
          placeholder="No. of people"
          class="ml-4 border rounded p-1 w-24 outline-none"
        />
        </label>
        </div>
      </div>

      <!-- Search Button -->
      <div class="text-center">
        <router-link to="/tripdetail">
          <button class="bg-sky-400 text-white px-8 py-3 rounded-full font-semibold hover:bg-sky-600 transition">Search</button>
        </router-link>
      </div>
    </div>
  </div>
</template>
