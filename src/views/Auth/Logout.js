import React from 'react'
import jwtDecode from 'jwt-decode'
import './Logout.css'

const token = window.localStorage.getItem('token')
const user = token ? jwtDecode(token) : null

const LogOut = ({ className }) => {
  if (!user) return null
  return (
    <div className={`logout-button px-3 ${user.user_type}`} title={user.user_type}>
      <span className="mr-2">{user.user_type}</span>
      <span className="mr-2">{user.email}</span>
      <span className="logout" onClick={() => {
        window.localStorage.removeItem('token')
        window.location.reload(true)
      }}>
        Logout
      </span>
    </div>
  )
}

export default LogOut
