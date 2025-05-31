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

    <main class="flex flex-col items-center text-center mt-10">
      <h1 class="text-4xl md:text-5xl font-bold text-sky-400 mb-3">
        One platform for all your<br />
        <span class="text-gray-900">travel planning needs</span>
      </h1>
      <p class="text-gray-700 max-w-xl mt-4 mb-6">
        Plan trips effortlessly with Trippify, your all-in-one travel assistant. From smart itineraries to shared expense tracking, everything your group needs in one place.
      </p>
      <router-link to="/planner">
      <button class="bg-sky-400 text-white px-6 py-3 rounded-full font-semibold hover:bg-sky-600 transition">
        Start Planning
      </button>
      </router-link>
      
    </main>

    <footer class="flex flex-wrap justify-center items-center mt-20 space-x-6">
      <div class="text-sm text-gray-600 mt-4">Scratch map</div>
      <div class="text-sm text-gray-600 mt-4">Documents</div>
      <div class="text-sm text-gray-600 mt-4">eSIM</div>
      <div class="text-sm text-gray-600 mt-4">Profile</div>
      <div class="text-sm text-gray-600 mt-4">Checklist</div>
      <div class="text-sm text-gray-600 mt-4">Planner</div>
      <div class="text-sm text-gray-600 mt-4">Budget</div>
      <div class="text-sm text-gray-600 mt-4">Journal</div>
    </footer>
  </div>
</template>
