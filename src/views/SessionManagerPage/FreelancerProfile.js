import React, {
  useEffect,
  useState
} from 'react'

import {
  Container,
  Row,
  Col,
  Button
} from 'react-bootstrap'
import {
  FaEye,
  FaPencilAlt
} from 'react-icons/fa'
import {
  getUser,
  getProfileByUser,
  getUserById,
  createProfile,
  updateProfile,
  updateUserFields,
} from '../../services'

import ProfileView from './components/ProfileView'
import ProfileForm from './components/ProfileForm'
import RequestList from './components/Requests'
import './style.scss'

const FreelancerProfilePage = () => {
  const [user, setUser] = useState({})
  const [profile, setProfile] = useState(null)
  const [editProfile, setEditProfile] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      const u = getUser()
      const fU = await getUserById(u.id)
      const pF = await getProfileByUser(u.id)
      setUser(fU || {})
      setProfile(pF)
    }
    loadData()
  }, [editProfile])

  const saveProfile = async ({
    userFields,
    profileFields
  }) => {
    await updateUserFields(user._id, userFields)
    if (profile && profile._id) {
      await updateProfile(profile._id, profileFields)
    } else {
      await createProfile({
        ...profileFields,
        user: user._id
      })
    }
    setEditProfile(false)
  }

  return (
    <div className='page py-5'>
      <Container>
        <Row>
          <Col>
            {editProfile
            ? (
              <>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="link"
                    className="ml-auto text-danger cursor-pointer"
                    onClick={()=>{setEditProfile(false)}}
                  >
                    <FaEye className='mr-2'/>
                    View
                  </Button>
                </div>
                <ProfileForm
                  user={user}
                  profile={profile}
                  save={saveProfile}
                  cancel={() => { setEditProfile(false) }}
                />
              </>
            ) : (
              <>
                <div className="d-flex justify-content-end">
                  <Button
                    variant="link"
                    className="ml-auto text-danger cursor-pointer"
                    onClick={()=>{setEditProfile(true)}}
                  >
                    <FaPencilAlt className='mr-2'/>
                    Edit
                  </Button>
                </div>
                <ProfileView
                  user={user}
                  profile={profile}
                  editProfile={() => {
                    setEditProfile(true)
                  }}
                />
              </>
            )}
          </Col>
          <Col>
            <RequestList
              user={user}
            />
          </Col>
        </Row>
      </Container>
    </div>
  )
}

export default FreelancerProfilePage
