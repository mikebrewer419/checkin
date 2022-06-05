import { createSlice } from '@reduxjs/toolkit'

export const freelancerSlice = createSlice({
  name: 'freelancers',
  initialState: {
    uninvited: {
      total: 0,
      skip: 0,
      profiles: []
    },
    invited: []
  },
  reducers: {
    setUninvited: (state, action) => {
      state = {...state, uninvited: action.payload}
      return state
    },
    setInvited: (state, action) => {
      state = {...state, invited: action.payload }
      return state
    }
  }
})
export const { setUninvited, setInvited } = freelancerSlice.actions

export default freelancerSlice.reducer