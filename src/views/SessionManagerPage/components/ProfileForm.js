import React, { useState } from 'react'
import DatePicker from 'react-multi-date-picker'
import AvatarChoose from '../../../components/avatar-choose'
import _ from 'lodash'
import { FREELANCER_TIMEZONE, FREELANCER_WORK_AS } from '../../../constants'

const ProfileForm = ({
  user = {},
  profile = {},
  save,
  cancel
}) => {
  const [logo, setLogo] = useState(null)
  const [firstName, setFirstName] = useState(_.get(user, 'first_name',''))
  const [lastName, setLastName] = useState(_.get(user, 'last_name', ''))
  const [willWorkAs, setWillWorkAs] = useState(_.get(profile, 'will_work_as', []))
  const [experience, setExperience] = useState(_.get(profile, 'experience', ''))
  const [availableDates, setAvailableDates] = useState(_.get(profile, 'available_dates', []))
  const [nonAvailableDates, setNonAvailableDates] = useState(_.get(profile, 'non_available_dates', []))
  const [avabilityNotes, setAvabilityNotes] = useState(_.get(profile, 'avability_notes', ''))
  const [timezone, setTimezone] = useState(FREELANCER_TIMEZONE[0])
  const [phone, setPhone] = useState('')
  const [receiveEmail, setReceiveEmail] = useState(false)

  const willWorkAsOption = willWorkAs.length > 1 ? 'both': willWorkAs[0]

  const handleSave = () => {
    const userFields = new FormData()
    if (logo) { userFields.append('logo', logo) }
    userFields.append('first_name', firstName)
    userFields.append('last_name', lastName)
    const profileFields = {
      will_work_as: willWorkAs,
      experience: experience,
      available_dates: availableDates.map(d => new Date(d).toISOString()),
      non_available_dates: nonAvailableDates.map(d => new Date(d).toISOString()),
      avability_notes: avabilityNotes,
      timezone,
      phone,
      receive_email: receiveEmail
    }
    save({ userFields, profileFields })
  }

  return (
    <div className='profile-edit'>
      <AvatarChoose
        logo={logo}
        setLogo={setLogo}
      />
      <div className='d-flex mt-3'>
        <div className='form-group w-50'>
          <label className='h6'>First Name</label>
          <input className='form-control' type="text" value={firstName} onChange={ev => { setFirstName(ev.target.value) }} />
        </div>
        <div className='form-group w-50'>
          <label className='h6'>Last Name</label>
          <input className='form-control' type="text" value={lastName} onChange={ev => { setLastName(ev.target.value) }} />
        </div>
      </div>
      <div className='form-group'>
        <label className='d-block h6'>Will work as</label>
        <select value={willWorkAsOption} className='form-control' onChange={(ev) => {
          if (ev.target.value === 'both') {
            setWillWorkAs(Object.values(FREELANCER_WORK_AS))
          } else {
            setWillWorkAs([ev.target.value])
          }
        }}>
          <option disabled={willWorkAsOption} value={undefined}>-</option>
          {Object.values(FREELANCER_WORK_AS).map(workAs => {
            return (<option key={workAs} value={workAs}>{workAs}</option>)
          })}
          <option key='both' value='both'>Both</option>
        </select>
      </div>
      <div className='form-group'>
        <label className='d-block h6'>Experience</label>
        <textarea className='form-control' type='text' name='experience' value={experience} onChange={ev => { setExperience(ev.target.value) }} />
      </div>
      <div className='form-group'>
        <label className='d-block h6'>Available dates</label>
        <DatePicker containerClassName='w-100' inputClass='form-control' value={availableDates} onChange={setAvailableDates} />
      </div>
      <div className='form-group'>
        <label className='d-block h6'>Non available dates</label>
        <DatePicker containerClassName='w-100' inputClass='form-control' value={nonAvailableDates} onChange={setNonAvailableDates} />
      </div>
      <div className='form-group'>
        <label className='d-block h6'>Avability Notes</label>
        <textarea className='form-control' type='text' name='avability_notes' value={avabilityNotes} onChange={ev => { setAvabilityNotes(ev.target.value) }} />
      </div>
      <div className='form-group'>
        <label className='d-block h6'>Timezone</label>
        <select value={timezone} className='form-control' onChange={(ev) => { setTimezone(ev.target.value) }} >
          {FREELANCER_TIMEZONE.map(tz => {
            return (<option key={tz} value={tz}>{tz}</option>)
          })}
        </select>
      </div>
      <div className='form-group'>
        <label className='h6'>Phone</label>
        <input className='form-control' type="text" value={phone} onChange={ev => { setPhone(ev.target.value) }} />
      </div>
      <div className='form-group d-flex align-items-center'>
        <label className='h6'>Receive Email</label>
        <div className='ml-2 receive-email-wrapper'>
          <input
            className='form-control'
            type="checkbox"
            checked={receiveEmail}
            onChange={ev => { setReceiveEmail(!!ev.target.checked) }}
          />
        </div>
      </div>
      <div className='d-flex justify-content-end'>
        <button className='btn btn-default mr-2' onClick={cancel}>Cancel</button>
        <button className='btn btn-danger' onClick={handleSave}>Save</button>
      </div>
    </div>
  )
}

export default ProfileForm
