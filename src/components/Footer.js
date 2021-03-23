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
    <div className="no-print text-center text-primary mb-4 app-footer d-flex justify-content-center">
      <img src={require('../assets/heyjoe.png')} className="heyjoe-logo br"/>
      <div className="d-inline-flex flex-column">
        <label>2021 North Shore Media, LLC. All Rights Reserved</label>
        <div className="d-flex">
          <a href="https://heyjoe.io/privacy-policy/" target="_blank" className="mr-2">
            Privacy policy
          </a>
          <a href="https://heyjoe.io/terms-and-conditions/" target="_blank">
            Terms and conditions.
          </a>
        </div>
      </div>
      
    </div>
  )
}

export default withRouter(Footer)
