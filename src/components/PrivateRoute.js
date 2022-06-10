import React, {useEffect} from 'react'
import {
  Route,
  Redirect,
} from 'react-router-dom'
import { useAuthedUser } from '../hooks/auth'
import Error403 from '../views/Errors/403'
export default ({
  path,
  component,
  accessTypes,
  ...props
}) => {
  const user = useAuthedUser()
  if (!user) {
    return <Redirect to="/login" />
  }
  if (!!accessTypes && !accessTypes.includes(user.user_type)) {
    return <Error403 />
  }
  
  return (
    <Route
      path={path}
      component={component}
      {...props}
    />
  )
}