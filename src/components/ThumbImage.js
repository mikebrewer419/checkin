import React, { useState, useEffect } from 'react'
import {
  static_root, 
  twr_static_host
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

  const root = props.isTwr ? `${twr_static_host}/record/` : static_root

  if (error) {
    return <img {...props} src={root+props.src} />
  }

  return <img onError={() => setError(true)} {...props} src={`${root+props.src}.thumb`} />
}

export default ThumbImage
