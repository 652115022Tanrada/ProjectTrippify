// src/store/trip.js
export default {
  namespaced: true,
  state: () => ({
    tripPlan: null,
  }),
  mutations: {
    setTripPlan(state, data) {
      state.tripPlan = data;
    },
    updateTripPlan(state, newPlan) {
      state.tripPlan = newPlan;
    },
    clearTripPlan(state) {
      state.tripPlan = null;
    },
    SET_TRIP_PLAN(state, tripPlan) {
      state.tripPlan = tripPlan;
    },
  },
  actions: {
    async fetchTripPlan({ commit }, tripId) {
      try {
        const res = await axios.get(`/api/trip/${tripId}`);
        commit("SET_TRIP_PLAN", res.data.tripPlan);
      } catch (err) {
        console.error("Error fetching trip plan:", err);
      }
    },
  },
  getters: {
    getTripPlan(state) {
      return state.tripPlan;
    }
  }
}
