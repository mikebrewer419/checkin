import React from 'react'
import { withRouter } from 'react-router-dom'

const excludePaths = [
  '/studio',
  '/onboard'
]

const Footer = (props) => {
  
  if (excludePaths.find(path => props.location.pathname.startsWith(path))) {
    return null
  }

  return (
    <div className="text-center text-primary">
      <img src="https://heyjoe.io/wp-content/uploads/2019/06/heyjoe.png" className="footer-logo"/>
      &copy; 2020 North Shore Media, LLC. All Rights Reserved
    </div>
  )
}

export default withRouter(Footer)
