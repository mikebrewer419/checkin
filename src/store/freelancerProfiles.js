import { createSlice } from '@reduxjs/toolkit'

export const freelancerSlice = createSlice({
  name: 'freelancers',
  initialState: {
    total: 0,
    skip: 0,
    profiles: []
  },
  reducers: {
    set: (state, action) => {
      state = action.payload
      return state
    },
   
  }
})
export const { set } = freelancerSlice.actions

export default freelancerSlice.reducer