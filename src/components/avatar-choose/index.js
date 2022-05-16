import React, { useRef, useState } from 'react'
import Webcam from "react-webcam"
import { uploadImage, temp_root, static_root } from '../../services'
import { dataURLtoFile } from '../../utils'
import './style.scss'

const AvatarChoose = ({
  logo,
  setLogo,
}) => {
  const [uploading, setUploading] = useState(false)
  const [cameraError, setCameraError] = useState(false)
  const [avatar64, setAvatar64] = useState(logo)
  const webcamRef = useRef(null)

  const takePhoto = () => {
    const imageSrc = webcamRef.current.getScreenshot()
    if (imageSrc && imageSrc.includes(',')) {
      const file = dataURLtoFile(imageSrc, `${new Date()}.jpg`)
      setAvatarImg(file)
    }
  }

  const setAvatarImg = async (file) => {
    const stime = + new Date()
    setUploading(true)
    const res = await uploadImage(file)
    setAvatar64(res.name)
    setLogo(res.name)
    const duration = +new Date() - stime
    setTimeout(() => {
      setUploading(false)
      // hack around waiting content download time.
      // assume download takes same amount of time as upload
    }, duration)
  }

  return (
    <div className="avatar-choose">
      {cameraError || avatar64 ?
        <img src={avatar64 ? `${temp_root}tmp/${avatar64}` : require('../../assets/camera.png')} />
      :
        <Webcam
          audio={false}
          ref={webcamRef}
          forceScreenshotSourceSize
          mirrored
          screenshotFormat="image/jpeg"
          onUserMediaError={() => { setCameraError(true) }}
          videoConstraints={{ 
            width: 4000,
            height: 4000,
            facingMode: "user"
          }}
          className="camera-wrapper"
        />
      }
      <input
        type="file"
        id="photo"
        accept="image/*"
        onChange={ev => setAvatarImg(ev.target.files[0])}
      />
      {uploading && <div className="uploading">
        Uploading ...
      </div>}
      <div className="d-flex justify-content-center">
        {!cameraError && (!avatar64 ?
          <button className="btn btn-secondary btn-sm mr-2" onClick={takePhoto}>
            Take Photo
          </button>
        :
          <button className="btn btn-secondary btn-sm mr-2" onClick={() => {
            setAvatar64(null)
          }}>
            Retake Photo
          </button>
        )}
        <button className="btn btn-secondary btn-sm" onClick={() => {
          document.querySelector('#photo').click()
        }}>
          Browse Photo
        </button>
      </div>
    </div>
  )
}

export default AvatarChoose
