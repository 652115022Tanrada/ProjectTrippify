// src/store/index.js
import { createStore } from 'vuex'
import trip from './trip'

export default createStore({
  modules: {
    trip
  }
})
