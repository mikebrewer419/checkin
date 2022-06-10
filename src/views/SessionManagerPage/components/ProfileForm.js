import React, { useState } from 'react'
import DatePicker from 'react-multi-date-picker'
import AvatarChoose from '../../../components/avatar-choose'
import {
  Container,
  Row,
  Col,
  Form,
  Button
} from 'react-bootstrap'
import _ from 'lodash'
import { FREELANCER_TIMEZONE, FREELANCER_WORK_AS } from '../../../constants'

const ProfileForm = ({
  user,
  profile,
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
      <Container className="mt-4">
        <Form.Row>
          <Form.Group as={Col}>
            <Form.Label className='h6'>First Name</Form.Label>
            <Form.Control
              type="text"
              value={firstName}
              onChange={ev => { setFirstName(ev.target.value) }}
            />
          </Form.Group>
          <Form.Group as={Col}>
            <Form.Label className='h6'>Last Name</Form.Label>
            <Form.Control
              type="text"
              value={lastName}
              onChange={ev => { setLastName(ev.target.value) }}
            />
          </Form.Group>
        </Form.Row>
        <Form.Group>
          <Form.Label className='d-block h6'>Will work as</Form.Label>
          <Form.Control
            as="select"
            value={willWorkAsOption}
            onChange={(ev) => {
              if (ev.target.value === 'both') {
                setWillWorkAs(Object.values(FREELANCER_WORK_AS))
              } else {
                setWillWorkAs([ev.target.value])
              }
            }}
          >
            <option disabled={willWorkAsOption} value={undefined}>-</option>
            {Object.values(FREELANCER_WORK_AS).map(workAs => {
              return (<option key={workAs} value={workAs}>{workAs}</option>)
            })}
            <option key='both' value='both'>Both</option>
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label className='d-block h6'>Experience</Form.Label>
          <textarea className='form-control' type='text' name='experience' value={experience} onChange={ev => { setExperience(ev.target.value) }} />
        </Form.Group>
        <Form.Group>
          <Form.Label className='d-block h6'>Available dates</Form.Label>
          <DatePicker containerClassName='w-100' inputClass='form-control' value={availableDates} onChange={setAvailableDates} />
        </Form.Group>
        <Form.Group>
          <Form.Label className='d-block h6'>Non available dates</Form.Label>
          <DatePicker containerClassName='w-100' inputClass='form-control' value={nonAvailableDates} onChange={setNonAvailableDates} />
        </Form.Group>
        <Form.Group>
          <Form.Label className='d-block h6'>Avability Notes</Form.Label>
          <textarea className='form-control' type='text' name='avability_notes' value={avabilityNotes} onChange={ev => { setAvabilityNotes(ev.target.value) }} />
        </Form.Group>
        <Form.Group>
          <Form.Label className='d-block h6'>Timezone</Form.Label>
          <Form.Control
            as="select"
            value={timezone}
            onChange={(ev) => { setTimezone(ev.target.value) }}
          >
            {FREELANCER_TIMEZONE.map(tz => (<option key={tz} value={tz}>{tz}</option>))}
          </Form.Control>
        </Form.Group>
        <Form.Group>
          <Form.Label className='h6'>Phone</Form.Label>
          <Form.Control
            type="text"
            value={phone}
            onChange={ev => { setPhone(ev.target.value) }}
          />
        </Form.Group>
        <Form.Group>
          <Form.Check
            label="Receive Email"
            checked={receiveEmail}
            onChange={ev => { setReceiveEmail(!!ev.target.checked) }}
          />
        </Form.Group>
        <Form.Row className="justify-content-end">
          <Button
            variant="primary"
            className="mr-2 btn-w-md"
            onClick={cancel}
          >
            Cancel
          </Button>
          <Button
            variant="danger"
            className='btn-w-md'
            onClick={handleSave}
          >
            Save
          </Button>
        </Form.Row>
      </Container>
    </div>
  )
}

export default ProfileForm
