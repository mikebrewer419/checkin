import { createSlice } from '@reduxjs/toolkit'

export const freelancerRequestSlice = createSlice({
  name: 'freelancerRequests',
  initialState: [],
  reducers: {
    set: (state, action) => {
      state = action.payload
      return state
    },
    add: (state, action) => {
      state = [...state, action.payload]
      return state
    },
    update: (state, action) => {
      const idx = state.findIndex(it=>it._id == action.payload._id)
      if (idx !== -1) {
        const temp = [...state]
        temp[idx] = action.payload
        state = temp
      } else {
        state = [...state, action.payload]
      }
      
      return state
    }
  }
})
export const { set, add, update } = freelancerRequestSlice.actions

export default freelancerRequestSlice.reducer