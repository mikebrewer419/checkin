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
    <div>
      <img
        className="w-50 mb-4 rounded-pill"
        src={logo ? static_root+logo : require('../../../assets/camera.png')}
      />
      <div className='d-flex'>
        <label className='h5 mr-3'>
          {user.first_name} {user.last_name}
        </label>
        <a className='ml-auto text-danger cursor-pointer' onClick={editProfile}>
          <FaPencilAlt className='mr-2'/>
          Edit
        </a>
      </div>
      <div>
        <label className='h6 mr-2'>Will work as</label>
        <span>{profile.will_work_as.join(', ')}</span>
      </div>
      <div>
        <label className='h6 mr-2'>Experience</label>
        <span>{profile.experience}</span>
      </div>
      <div>
        <label className='h6 mr-2'>Available dates</label>
        {profile.available_dates.map((dt, idx) => {
          return<span className='mr-2' key={idx}>{moment(new Date(dt)).format('MM/DD/YY')}</span>
        })}
      </div>
      <div>
        <label className='h6 mr-2'>Non available dates</label>
        {profile.non_available_dates.map((dt, idx) => {
          return<span className='mr-2' key={idx}>{moment(new Date(dt)).format('MM/DD/YY')}</span>
        })}
      </div>
      <div>
        <label className='h6 mr-2'>Avability Notes</label>
        <span>{profile.avability_notes}</span>
      </div>
    </div>
  )
}

export default ProfileView
