import React from 'react'
import { FaArrowLeft } from 'react-icons/fa';

const AuthHeader = ({ history }) => {
  return (
    <div className="bg-danger vw-100 p-3 d-flex justify-content-center header">
      {window.is_react_native && (
        <button className='btn btn-text btn-sm text-white back-btn' onClick={() => history.goBack() }>
          <FaArrowLeft />
        </button>
      )}
      <img src={require('../../assets/heyjoe.png')} className="heyjoe-logo white mx-auto"/>
      {window.is_react_native && (
        <button className='btn btn-text btn-sm text-white ' onClick={() => {
          try {
            if (window.ReactNativeWebView) {
              window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'leave' }))
            }
          } catch (err) {
            console.log('IGNORE: react native send info failed.', err)
          }
        }}>
          Leave
        </button>
      )}
    </div>
  )
}

export default AuthHeader
