import { configureStore } from '@reduxjs/toolkit'
import freelancerProfileReducer from './freelancerProfiles'
import freelancerRequestReducer from './freelancerRequests'
import userReducer from './users'
import studioReducer from './studios'

export default configureStore({
  reducer: {
    freelancerProfiles: freelancerProfileReducer,
    freelancerRequests: freelancerRequestReducer,
    users: userReducer,
    studios: studioReducer,
  }
})