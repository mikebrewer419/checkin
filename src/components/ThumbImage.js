import React, { useState, useEffect } from 'react'
import {
  static_root
} from '../services'

const ThumbImage = (props) => {
  const [error, setError] = useState(false)

  useEffect(() => {
    setError((false))
  }, [props.src])

  if (!props.src) {
    return <img
      {...props}
      src={require('../assets/camera.png')}
    />
  }

  if (error) {
    return <img {...props} src={static_root+props.src} />
  }

  return <img onError={() => setError(true)} {...props} src={`${static_root+props.src}.thumb`} />
}

export default ThumbImage
