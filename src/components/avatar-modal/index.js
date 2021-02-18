import React, { useState, useEffect } from 'react'
import { Modal } from 'react-bootstrap'
import {
  static_root,
  updateRecordField,
  uploadImage
} from '../../services'
import './style.scss'

const AvatarEditModal = ({
  record,
  show,
  edit = true,
  onClose
 }) => {
  const [avatar, setAvatar] = useState(record.avatar)
  const [uploading, setUploading] = useState(false)

  const setAvatarImg = async (file) => {
    setUploading(true)
    const res = await uploadImage(file)
    const savedRecord = await updateRecordField(record._id, {
      avatar: res.name
    })
    setAvatar(savedRecord.avatar)
    setUploading(false)
  }

  return (
    <Modal
      show={!!show}
      onHide = {onClose}
      size="lg"
    >
      <Modal.Header closeButton>
        <h4 className="mb-0">
          Edit Avatar
        </h4>
      </Modal.Header>
      <Modal.Body>
        <div className="image-section">
          <img
            src={avatar !== 'empty' ? static_root+avatar : require('../../assets/camera.png')}
            className="w-100 large-avatar"
          />
          {edit && (
            <input
              type="file"
              id="photo"
              accept="image/*"
              className="form-control mt-3"
              onChange={ev => setAvatarImg(ev.target.files[0])}
            />
          )}
          {uploading && <div className="uploading">
            Uploading ...
          </div>}
        </div>
      </Modal.Body>
      <Modal.Footer>
        <button className="btn btn-danger" onClick={onClose}>
          Done.
        </button>
      </Modal.Footer>
    </Modal>
  )
}

export default AvatarEditModal
