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
    }
  },
  getters: {
    getTripPlan(state) {
      return state.tripPlan;
    }
  }
}
