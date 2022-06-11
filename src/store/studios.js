import { createSlice } from '@reduxjs/toolkit'
import _ from 'lodash'

export const studioSlice = createSlice({
  name: 'studios',
  initialState: {
    count: 0,
    studios: []
  },
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
      const idx = state.studios.findIndex(it=>it._id == action.payload._id)
      if (idx !== -1) {
        const temp = _.cloneDeep(state)
        temp.studios[idx] = {
          ...temp.studios[idx],
          ...action.payload
        }
        state = temp
      } else {
        
      }
      
      return state
    }
  }
})
export const { set, add, update } = studioSlice.actions

export default studioSlice.reducer