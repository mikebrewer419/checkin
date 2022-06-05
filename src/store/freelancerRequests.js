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
    }
  }
})
export const { set, add } = freelancerRequestSlice.actions

export default freelancerRequestSlice.reducer