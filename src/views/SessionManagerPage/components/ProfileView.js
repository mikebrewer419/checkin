import React from 'react'
import moment from 'moment'
import { FaPencilAlt } from 'react-icons/fa'
import { static_root } from '../../../services'

const ProfileView = ({ user, profile, editProfile }) => {
  if (!profile || !profile._id) {
    return <div>
      <span>You don't have freelancer profile yet.</span>
      <a className='text-danger ml-2 cursor-pointer'
        onClick={editProfile}
      > Create Profile </a>
    </div>
  }
  const { logo } = user || {}

  return (
    <div className='profile-view'>
      <img
        className="w-50 mb-4 rounded-pill"
        src={logo ? static_root+logo : require('../../../assets/camera.png')}
      />
      <div className='d-flex'>
        <label className='h4 mr-3 mb-4'>
          {user.first_name} {user.last_name}
        </label>
        <a className='ml-auto text-danger cursor-pointer' onClick={editProfile}>
          <FaPencilAlt className='mr-2'/>
          Edit
        </a>
      </div>
      <div className='mb-3 d-flex flex-column'>
        <label className='label mb-0'>Will work as</label>
        <span>{profile.will_work_as.join(', ')}</span>
      </div>
      <div className='d-flex'>
        <div className='mb-3 d-flex flex-column w-50'>
          <label className='h6 mr-2'>Timezone</label>
          <span>{profile.timezone}</span>
        </div>
        <div className='mb-3 d-flex flex-column w-50'>
          <label className='h6 mr-2'>Phone</label>
          <span>{profile.phone}</span>
        </div>
      </div>
      <div className='mb-3 d-flex flex-column'>
        <label className='label mb-0'>Experience</label>
        <span>{profile.experience}</span>
      </div>
      <div className='mb-3 d-flex flex-column'>
        <label className='label mb-0'>Available dates</label>
        <div className='w-75 d-flex flex-wrap'>
          {profile.available_dates.map((dt, idx) => {
            return<span className='mr-2 mb-0' key={idx}>{moment(new Date(dt)).format('MM/DD/YY')}</span>
          })}
        </div>
      </div>
      <div className='mb-3 d-flex flex-column'>
        <label className='label mb-0'>Unavailable dates</label>
        <div className='w-75 d-flex flex-wrap'>
          {profile.non_available_dates.map((dt, idx) => {
            return<span className='mr-2 mb-0' key={idx}>{moment(new Date(dt)).format('MM/DD/YY')}</span>
          })}
        </div>
      </div>
      <div className='mb-3 d-flex flex-column'>
        <label className='h6 mr-2'>Avability Notes</label>
        <span>{profile.avability_notes}</span>
      </div>
      <div className='mb-3 d-flex flex-column'>
        <label className='h6 mr-2'>Receive Email</label>
        <span>{profile.receive_email ? 'Yes': 'No'}</span>
      </div>
    </div>
  )
}

export default ProfileView
