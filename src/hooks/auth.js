import React, {
  createContext,
  useContext
} from 'react'

export const AuthContext = createContext(null)

export const useAuthedUser = function () {
  const authedUser = useContext(AuthContext)
  return authedUser
}