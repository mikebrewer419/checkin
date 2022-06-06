import { configureStore } from '@reduxjs/toolkit'
import freelancerProfileReducer from './freelancerProfiles'
import freelancerRequestReducer from './freelancerRequests'

export default configureStore({
  reducer: {
    freelancerProfiles: freelancerProfileReducer,
    freelancerRequests: freelancerRequestReducer 
  }
})