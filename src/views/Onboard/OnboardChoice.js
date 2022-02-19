import React from 'react'
import { static_root } from '../../services'

import './onboardchoice.scss'

const OnboardChoice = ({ history, studio, session, hideChoice }) => {
  return (
    <div className='onboard-choice'>
      <div className='d-flex flex-column align-items-center p-3 bg-danger'>
        <img
          className="logo d-block m-auto"
          src={static_root+studio.logo}
          alt={studio.name}
        />
        <h3 className="brand mt-4 text-white">Welcome to {studio.name}/{session.name} Virtual Check In</h3>
      </div>
      <div className='d-flex flex-column align-items-center'>
        <p className='h5 text-center'>Choose an option below to check in to your session</p>
        <button
          className='btn btn-danger btn-lg'
          onClick={() => {
            const q = !window.is_react_native ? '' : '?nativeFrame=true'
            history.push('/login' + q)
          }}
        >
          LOGIN TO TALENT ACCOUNT
        </button>
        <button
          className='btn btn-danger btn-lg d-flex flex-column align-items-center'
          onClick={() => {
            const q = !window.is_react_native ? '' : '?nativeFrame=true'
            history.push('/talent/register' + q)
          }}
        >
          CREATE TALENT ACCOUNT
          <small>It's free to join</small>
        </button>
        <button className='btn btn-danger btn-lg' onClick={() => { hideChoice() }}>
          CHECK IN AS GUEST
        </button>
      </div>
    </div>
  )
}

export default OnboardChoice
