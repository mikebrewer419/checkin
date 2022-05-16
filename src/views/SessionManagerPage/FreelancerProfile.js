import React, { useEffect, useState } from 'react'
import { getUser, getProfileByUser, getUserById, createProfile, updateProfile, updateUserFields, listRequests  } from '../../services'
import ProfileView from './components/ProfileView'
import ProfileForm from './components/ProfileForm'
import RequestList from './components/Requests'
import './style.scss'

const FreelancerProfilePage = () => {
  const [user, setUser] = useState({})
  const [profile, setProfile] = useState({})
  const [editProfile, seteditProfile] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      const u = getUser()
      const fU = await getUserById(u.id)
      const pF = await getProfileByUser(u.id)
      setUser(fU || {})
      setProfile(pF || {})
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
    seteditProfile(false)
  }

  return (
    <div className='page'>
      <div className='container'>
        <div className='row py-5'>
          <div className='col col-6'>
            {editProfile
            ? <ProfileForm
              user={user}
              profile={profile}
              save={saveProfile}
              cancel={() => { seteditProfile(false) }}
            />
            : <ProfileView
              user={user}
              profile={profile}
              editProfile={() => {
                seteditProfile(true)
              }}
            />}
          </div>
          <div className='col col-6'>
            <RequestList
              user={user}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default FreelancerProfilePage
