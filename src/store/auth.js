import axios from 'axios'
const API_URL = import.meta.env.VITE_API_URL

export default {
  namespaced: true,
  state: () => ({
    user: null
  }),
  mutations: {
    setUser(state, user) {
      state.user = user
    },
    clearUser(state) {
      state.user = null
    }
  },
  actions: {
    login({ commit }, { user }) {
      commit('setUser', user)
    },
    logout({ commit }) {
      commit('clearUser')
    },

    async fetchUser({ commit }) {
      try {
        const res = await axios.get(
          `${API_URL}/auth/user`,
          { withCredentials: true }
        )
        commit('setUser', res.data)
      } catch (e) {
        commit('clearUser')
      }
    }
  },
  getters: {
    getUser: state => state.user,
    isLoggedIn: state => !!state.user
  }
}
