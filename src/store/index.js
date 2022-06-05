import { configureStore } from '@reduxjs/toolkit'
import freelancerReducer from './freelancers'
import freelancerRequestReducer from './freelancerRequests'

export default configureStore({
  reducer: {
    freelancers: freelancerReducer,
    freelancerRequests: freelancerRequestReducer 
  }
})