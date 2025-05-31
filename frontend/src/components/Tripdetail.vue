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

    <!-- Main content -->
    <main class="flex flex-col md:flex-row w-full">
      <!-- Timeline -->
      <div class="w-full md:w-2/3 p-6">
        <h2 class="text-lg font-bold mb-4">Day 1</h2>
        <div class="border-l-2 border-dashed border-gray-400 pl-6 space-y-8">
          <!-- Activity 1 -->
          <div>
            <p class="text-sm text-gray-600">09.00 a.m.</p>
            <div class="flex items-start space-x-4">
              <div class="w-6 h-6 rounded-full bg-black text-white text-sm flex items-center justify-center">1</div>
              <div>
                <!-- <img src="/example.jpg" alt="place" class="w-full h-24 object-cover rounded mb-2" /> -->
                <!-- Nearby Suggestion -->
                <div class="border border-red-400 p-2 rounded text-red-500 bg-red-50 mb-2">
                  <p class="font-semibold mb-1">Nearby Suggestion</p>
                  <div class="flex items-center justify-between text-gray-700">
                    <span>📍 Location name</span>
                    <div class="space-x-2">
                      <button class="text-green-600">✔️</button>
                      <button class="text-red-600">❌</button>
                      <button class="text-yellow-600">📌</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Activity 2 -->
          <div>
            <p class="text-sm text-gray-600">02.00 p.m.</p>
            <div class="flex items-start space-x-4">
              <div class="w-6 h-6 rounded-full bg-black text-white text-sm flex items-center justify-center">2</div>
              <div>
                <!-- <img src="/example.jpg" alt="place" class="w-full h-24 object-cover rounded mb-2" /> -->
              </div>
            </div>
          </div>

          <!-- Buttons -->
          <div class="flex space-x-4 mt-6">
            <button class="bg-yellow-400 px-4 py-2 rounded font-semibold hover:bg-yellow-500">Modify trip</button>
            <button class="bg-green-500 text-white px-4 py-2 rounded font-semibold hover:bg-green-600">Confirm</button>
          </div>
        </div>
      </div>

      <!-- Map -->
      <div class="w-full md:w-1/3 p-6 border-l">
        <!-- <img src="/map-placeholder.png" alt="Map" class="w-full h-[500px] object-contain" /> -->
        <div class="mt-4 text-sm text-gray-600 space-y-1">
          <p>🟢 0 km</p>
          <p class="text-red-600">🔴 10 km</p>
          <p class="text-pink-600">🔴 20 km</p>
        </div>
      </div>
    </main>
  </div>
</template>
