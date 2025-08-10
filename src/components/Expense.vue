<script setup>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import Swal from "sweetalert2";

const route = useRoute();
const router = useRouter();
const showLoginModal = ref(false);
const user = ref(null);
const activeTab = ref("expenses");
const tripId = route.query.tripId;
const showExpenseModal = ref(false);
const selectedDate = ref(new Date().toISOString().split("T")[0]);
const dateInput = ref(null);
const selectedCategory = ref("");
const categories = ["Sleep", "Transport", "See & Do", "Eat & Drink", "Other"];
const showCategoryModal = ref(false);
const amount = ref("");
const selectedCurrency = ref("THB");
const currencies = ["THB", "USD"];
const isPaid = ref(false);
const editingIndex = ref(null); 

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

// จำลองข้อมูลผู้ใช้งาน (อีเมลตัวเอง) และเพื่อนร่วมทริป
const currentUserEmail = ref("youremail@example.com"); // เปลี่ยนเป็น email จริงจากระบบ auth
const participants = ref([
  "youremail@example.com",
  "friend1@example.com",
  "friend2@example.com",
]);

participants.value = [
  { name: "Tanrada", email: "tanrada@example.com" },
  { name: "Trippify", email: "trippify@example.com" },
];

const paidBy = ref(""); // ใช้สำหรับเก็บคนจ่าย
const expenses = ref([]); // เก็บรายการที่บันทึกไว้
const note = ref("");

// อัปเดต saveExpense ให้รองรับการแก้ไข
const saveExpense = () => {
  const newExpense = {
    date: new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    }),
    category: selectedCategory.value,
    amount: parseFloat(amount.value),
    paidBy: paidBy.value,
    note: note.value,
    isPaid: isPaid.value,
    currency: selectedCurrency.value,
  };

  if (editingIndex.value !== null) {
    expenses.value[editingIndex.value] = newExpense; // แก้ไขแทนที่เดิม
    editingIndex.value = null;
  } else {
    expenses.value.push(newExpense); // เพิ่มใหม่
  }

  // เคลียร์ฟอร์ม
  amount.value = "";
  selectedCategory.value = "";
  note.value = "";
  isPaid.value = false;
  selectedCurrency.value = "THB";
};

// ผลรวมทั้งหมด
const totalCost = computed(() => {
  return expenses.value.reduce((sum, e) => sum + (e.amount || 0), 0);
});

// ผลรวมแยกตามประเภท
const categoryTotals = computed(() => {
  const totals = {
    Sleep: 0,
    Transport: 0,
    "See & Do": 0,
    "Eat & Drink": 0,
    Other: 0,
  };
  expenses.value.forEach((e) => {
    if (totals[e.category] !== undefined) {
      totals[e.category] += e.amount || 0;
    }
  });
  return totals;
});

const editExpense = (index) => {
  const expense = expenses.value[index];
  selectedCategory.value = expense.category;
  amount.value = expense.amount;
  selectedCurrency.value = expense.currency;
  note.value = expense.note;
  isPaid.value = expense.isPaid;
  paidBy.value = expense.paidBy;
  editingIndex.value = index;
  showExpenseModal.value = true;
};

const deleteExpense = (index) => {
  Swal.fire({
    icon: "warning",
    title: "Are you sure?",
    text: "This expense will be deleted.",
    showCancelButton: true,
    confirmButtonText: "Yes, delete it",
    confirmButtonColor: "#ef4444",
  }).then((result) => {
    if (result.isConfirmed) {
      expenses.value.splice(index, 1);
      Swal.fire("Deleted!", "Your expense has been removed.", "success");
    }
  });
};

const loadTripData = async () => {
  const res = await axios.get(`http://localhost:5000/api/trip/${tripId}`, {
    withCredentials: true,
  });
  store.commit("trip/updateTripPlan", res.data);
};

onMounted(() => {
  getUser();
  paidBy.value = currentUserEmail.value;
});
onMounted(() => {
  if (tripId) {
    loadTripData();
  }
});

const openExpenseModal = () => {
  showExpenseModal.value = true;
};
const closeExpenseModal = () => {
  showExpenseModal.value = false;
};
const openDatePicker = () => {
  if (dateInput.value) {
    dateInput.value.showPicker?.() || dateInput.value.click();
  }
};

const getCategoryIcon = (category) => {
  switch (category) {
    case "Sleep":
      return "fa-bed";
    case "Transport":
      return "fa-car";
    case "See & Do":
      return "fa-camera";
    case "Eat & Drink":
      return "fa-utensils";
    default:
      return "fa-ellipsis";
  }
};

const getParticipantName = (email) => {
  const participant = participants.value.find((p) => p.email === email);
  return participant ? participant.name : email;
};
</script>

<template>
  <div class="min-h-screen flex flex-col bg-gray-50 text-gray-800 font-kanit">
    <header
      class="w-full flex justify-between items-center py-4 px-8 bg-white shadow-sm sticky top-0 z-10"
    >
      <router-link to="/">
        <img src="/logo.png" alt="Logo" class="h-10 w-auto" />
      </router-link>

      <nav
        class="flex items-center space-x-6 text-gray-700 font-medium text-sm"
      >
        <router-link to="/" class="hover:text-sky-600 transition"
          >Home</router-link
        >
        <router-link to="/saved-trips" class="hover:text-sky-600 transition"
          >Planner</router-link
        >
        <router-link to="/expense" class="hover:text-sky-600 transition"
          >Expense Tracker</router-link
        >
        <router-link to="/review" class="hover:text-sky-600 transition"
          >Trip Review</router-link
        >

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

    <!-- Login Modal -->
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
          <img
            :src="user.photo"
            class="w-24 h-24 rounded-full mx-auto ring-4 ring-sky-200 mb-4"
          />
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
          <h1 class="text-2xl font-bold text-gray-800">Welcome to Trippify</h1>
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

    <div class="flex flex-1 min-h-screen bg-gray-50">
      <!-- Sidebar -->
      <aside class="w-64 bg-white p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h2 class="text-2xl font-extrabold text-sky-700 mb-4">Budget</h2>
          <div class="space-y-2">
            <button
              class="w-full text-left rounded-xl p-3 flex items-center gap-3 transition-colors"
              :class="{
                'bg-sky-100 text-sky-700 font-bold': activeTab === 'expenses',
                'text-gray-700 hover:bg-gray-100': activeTab !== 'expenses',
              }"
              @click="activeTab = 'expenses'"
            >
              <span>🧾</span><span class="text-sm">Expenses</span>
            </button>
            <button
              class="w-full text-left rounded-xl p-3 flex items-center gap-3 transition-colors"
              :class="{
                'bg-sky-100 text-sky-700 font-bold': activeTab === 'balance',
                'text-gray-700 hover:bg-gray-100': activeTab !== 'balance',
              }"
              @click="activeTab = 'balance'"
            >
              <span>⚖️</span><span class="text-sm">Balance</span>
            </button>
            <button
              class="w-full text-left rounded-xl p-3 flex items-center gap-3 transition-colors"
              :class="{
                'bg-sky-100 text-sky-700 font-bold':
                  activeTab === 'settlements',
                'text-gray-700 hover:bg-gray-100': activeTab !== 'settlements',
              }"
              @click="activeTab = 'settlements'"
            >
              <span>🤝</span><span class="text-sm">Settlements</span>
            </button>
          </div>

          <button
            @click="openExpenseModal"
            class="mt-8 w-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold py-3 px-4 rounded-full shadow-md transition"
          >
            <i class="fa-solid fa-plus-circle mr-2"></i> Add expense
          </button>

          <div class="mt-8 p-4 bg-gray-100 rounded-xl text-sm text-gray-700">
            <p class="font-semibold mb-2">Manage your budget together</p>
            <p class="text-gray-500 text-xs">
              Invite your friends to budget your trip together!
            </p>
            <a
              href="#"
              class="text-emerald-600 font-semibold mt-2 inline-block hover:underline"
            >
              <i class="fa-solid fa-user-plus mr-1"></i> Invite friends
            </a>
          </div>
        </div>
      </aside>

      <!-- Main content -->
      <main class="flex-1 p-8 overflow-y-auto">
        <template v-if="activeTab === 'expenses'">
          <h3 class="text-2xl font-bold text-gray-800 mb-6">
            📝 Saved Expenses
          </h3>

          <div
            v-for="(expense, index) in expenses"
            :key="index"
            class="bg-white rounded-2xl shadow-md p-6 flex justify-between items-center mb-4 transition-transform hover:scale-[1.01]"
          >
            <div class="flex items-center space-x-4">
              <div
                class="w-12 h-12 bg-sky-100 rounded-full flex items-center justify-center font-bold text-sky-700"
              >
                <i :class="['fa-solid', getCategoryIcon(expense.category)]"></i>
              </div>
              <div>
                <p class="font-bold text-gray-800">{{ expense.note }}</p>
                <p class="text-sm text-gray-500">
                  <span class="font-medium text-sky-600">{{
                    expense.category
                  }}</span>
                  by {{ getParticipantName(expense.paidBy) }} on
                  {{ expense.date }}
                </p>
              </div>
            </div>
            <div class="text-right">
              <p class="text-xl font-bold text-green-600">
                {{ expense.amount.toFixed(2) }} {{ expense.currency }}
              </p>
              <p
                class="text-sm"
                :class="expense.isPaid ? 'text-green-500' : 'text-red-500'"
              >
                {{ expense.isPaid ? "Paid" : "Unpaid" }}
              </p>
              <div class="flex gap-2 justify-end mt-2">
                <button
                  @click="editExpense(index)"
                  class="px-3 py-1 text-xs rounded-full bg-yellow-400 hover:bg-yellow-500 text-white"
                >
                  Edit
                </button>
                <button
                  @click="deleteExpense(index)"
                  class="px-3 py-1 text-xs rounded-full bg-red-500 hover:bg-red-600 text-white"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </template>

        <template v-else-if="activeTab === 'balance'">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">⚖️ Balance</h2>
          <p>Check everyone's balance here.</p>
        </template>

        <template v-else-if="activeTab === 'settlements'">
          <h2 class="text-2xl font-bold text-gray-800 mb-4">🤝 Settlements</h2>
          <p>Time to settle the bill!</p>
        </template>
      </main>

      <!-- Modal -->
      <div
        v-if="showExpenseModal"
        class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      >
        <div
          class="bg-white rounded-3xl w-full max-w-md p-8 shadow-xl relative"
        >
          <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">
            New Expense
          </h2>

          <!-- Category / Date / Destination -->
          <div class="flex gap-2 mb-6">
            <!-- <button class="flex-1 border rounded-full py-2">📂 Category</button> -->
            <button
              class="flex-1 border border-gray-300 rounded-full py-3 text-sm text-gray-700 font-semibold transition hover:bg-gray-100"
              @click="showCategoryModal = true"
            >
              📂 {{ selectedCategory || "Category" }}
            </button>
            <!-- Date Button (opens native date picker) -->
            <button
              @click="openDatePicker"
              class="flex-1 border border-gray-300 rounded-full py-3 text-sm text-gray-700 font-semibold transition hover:bg-gray-100"
            >
              📅
              {{
                new Date(selectedDate).toLocaleDateString("en-GB", {
                  day: "2-digit",
                  month: "short",
                })
              }}
            </button>
            <!-- Hidden date input -->
            <input
              ref="dateInput"
              v-model="selectedDate"
              type="date"
              :min="new Date().toISOString().split('T')[0]"
              class="hidden"
            />
            <button
              class="flex-1 border border-gray-300 rounded-full py-3 text-sm text-gray-700 font-semibold transition hover:bg-gray-100"
            >
              📍 Destination
            </button>
          </div>

          <!-- Category Modal -->
          <div
            v-if="showCategoryModal"
            class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <div class="bg-white p-6 rounded-2xl w-80 shadow-lg relative">
              <h3 class="text-xl font-bold mb-4">Select Category</h3>
              <button
                @click="showCategoryModal = false"
                class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
              >
                ✕
              </button>
              <ul>
                <li
                  v-for="cat in categories"
                  :key="cat"
                  @click="
                    selectedCategory = cat;
                    showCategoryModal = false;
                  "
                  class="cursor-pointer p-3 hover:bg-gray-100 rounded-xl flex items-center gap-3 transition"
                >
                  <i
                    :class="['fa-solid', getCategoryIcon(cat)]"
                    class="w-5 text-center"
                  ></i>
                  {{ cat }}
                </li>
              </ul>
              <div class="mt-4 border-t pt-4">
                <button
                  class="w-full bg-red-100 text-red-600 py-2 rounded-full hover:bg-red-200 transition font-semibold"
                  @click="
                    selectedCategory = '';
                    showCategoryModal = false;
                  "
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          <!-- Amount Input with Currency in One Border -->
          <div
            class="flex items-center justify-center mb-4 border border-gray-300 rounded-full overflow-hidden focus-within:ring-2 focus-within:ring-sky-200 transition"
          >
            <input
              v-model="amount"
              type="number"
              min="0"
              step="0.01"
              class="w-32 px-4 py-3 text-2xl font-bold text-gray-700 text-right focus:outline-none"
              placeholder="0.00"
            />
            <div class="w-px h-8 bg-gray-200"></div>
            <select
              v-model="selectedCurrency"
              class="px-4 py-3 text-base text-gray-700 bg-transparent focus:outline-none cursor-pointer"
            >
              <option v-for="cur in currencies" :key="cur" :value="cur">
                {{ cur }}
              </option>
            </select>
          </div>

          <!-- Expense name -->
          <div
            class="flex items-center bg-white p-3 rounded-xl border border-gray-300 mb-4 focus-within:ring-2 focus-within:ring-sky-200 transition"
          >
            <i class="fa-solid fa-note-sticky text-gray-400 mr-3"></i>
            <input
              type="text"
              placeholder="Enter expense name..."
              class="w-full outline-none bg-transparent"
              v-model="note"
            />
          </div>

          <!-- Status toggle -->
          <div class="flex justify-between items-center mb-6">
            <span class="text-gray-600 font-medium">Status</span>
            <label class="flex items-center cursor-pointer">
              <input type="checkbox" v-model="isPaid" class="sr-only" />
              <div
                class="w-12 h-6 rounded-full shadow-inner relative transition-colors duration-300"
                :class="isPaid ? 'bg-emerald-500' : 'bg-gray-300'"
              >
                <div
                  class="dot absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform duration-300"
                  :class="isPaid ? 'translate-x-full' : 'translate-x-0.5'"
                ></div>
              </div>
              <span
                class="ml-3 font-semibold"
                :class="isPaid ? 'text-emerald-600' : 'text-gray-500'"
              >
                {{ isPaid ? "Paid" : "Unpaid" }}
              </span>
            </label>
          </div>

          <!-- Paid By -->
          <div class="mb-6">
            <label class="block font-semibold text-gray-700 mb-2"
              >Paid by</label
            >
            <select
              v-model="paidBy"
              class="w-full border border-gray-300 rounded-full px-4 py-3 text-gray-700 focus:outline-none focus:ring-2 focus:ring-sky-200 transition"
            >
              <option v-for="p in participants" :key="p.email" :value="p.email">
                {{ p.name }}
              </option>
            </select>
          </div>

          <div class="flex justify-end gap-4">
            <button
              @click="closeExpenseModal"
              class="px-6 py-3 rounded-full bg-gray-200 text-gray-600 font-semibold hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              @click="
                saveExpense();
                closeExpenseModal();
              "
              class="px-8 py-3 rounded-full bg-emerald-500 text-white font-bold hover:bg-emerald-600 shadow-md transition"
            >
              Save expense
            </button>
          </div>

          <button
            @click="closeExpenseModal"
            class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold transition"
          >
            ✕
          </button>
        </div>
      </div>

      <!-- Summary -->
      <aside class="w-1/4 bg-white border-l border-gray-200 p-6 shadow-md">
        <div class="text-center mb-6 bg-gray-50 rounded-2xl p-6">
          <div class="relative inline-block w-40 h-40">
            <svg
              class="absolute top-0 left-0 w-full h-full text-emerald-300"
              viewBox="0 0 36 36"
            >
              <path
                class="text-gray-200"
                fill="none"
                stroke="currentColor"
                stroke-width="3.8"
                stroke-dasharray="100, 100"
                d="M18 2.0845
                a 15.9155 15.9155 0 0 1 0 31.831
                a 15.9155 15.9155 0 0 1 0 -31.831"
              />
            </svg>
            <div class="absolute inset-0 flex items-center justify-center">
              <p class="text-2xl font-extrabold text-gray-700">
                {{ totalCost.toFixed(2) }}
              </p>
            </div>
          </div> 
          <p class="text-lg font-semibold mt-4 text-gray-700">
            Total trip cost
          </p>
          <div class="flex justify-center space-x-4 mt-2 text-sm">
            <span class="text-green-500"
              >🟢 Paid {{ totalCost.toFixed(2) }}</span
            >
            <span class="text-gray-400">⚪ Pending 0.00</span>
          </div>
        </div>

        <ul class="space-y-3 mt-8">
          <li
            v-for="cat in categories"
            :key="cat"
            class="flex justify-between items-center text-gray-700"
          >
            <div class="flex items-center gap-3">
              <i
                :class="['fa-solid', getCategoryIcon(cat)]"
                class="w-4 text-center text-sky-500"
              ></i>
              <span class="font-medium">{{ cat }}</span>
            </div>
            <span class="font-semibold text-right"
              >{{ categoryTotals[cat].toFixed(2) }} {{ selectedCurrency }}</span
            >
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.menu-item-wrapper:hover {
  background-color: #d1fae5; /* Tailwind green-100 */
}
/* button:hover {
  background-color: #2563eb;
} */
</style>
