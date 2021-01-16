import React from 'react'
import { withRouter } from 'react-router-dom'

const excludePaths = [
  '/studio',
  '/onboard'
]

const Footer = (props) => {
  
  if (!props.force && excludePaths.find(path => props.location.pathname.startsWith(path))) {
    return null
  }

  return (
    <div className="no-print text-center text-primary mb-4 app-footer">
      <img src={require('../assets/heyjoe.png')} className="heyjoe-logo br"/>
      &copy; 2020 North Shore Media, LLC. All Rights Reserved
    </div>
  )
}

export default withRouter(Footer)
