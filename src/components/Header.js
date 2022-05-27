import React, { useState, useEffect } from 'react'
import { withRouter, useHistory } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Dropdown, Navbar, Image, Modal } from 'react-bootstrap'
import { FaInfoCircle, FaUser } from 'react-icons/fa';
import { getUser, getUserById, static_root } from '../services'
import UserForm from './userForm'
import { USER_TYPES, VERSION } from '../constants'
import { BiSupport } from 'react-icons/bi'
import { injectIntercom } from '../utils'
import './Header.scss'

const excludePaths = [
  '/onboard',
  '/message'
]

const Header = (props) => {
  const [user, setUser] = useState(null)
  const [editUser, setEditUser] = useState(false)
  const [needCredentials, setNeedCredentials] = useState(false)
  const history = useHistory()

  useEffect(() => {
    const u = getUser()
    setUser(u)
    if (!u) return
    getUserById(u.id).then(data => {
      if (!data) return 
      const need = [USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR].includes(data.user_type) &&
        (!data.twilio_account_sid ||
         !data.twilio_auth_token ||
         !data.twilio_from_number ||
         !data.comet_chat_appid ||
         !data.comet_chat_auth ||
         !data.comet_api_key)
      setNeedCredentials(need)
    })
  }, [editUser])

  if (excludePaths.find(path => props.location.pathname.startsWith(path))) {
    return null
  }

  if (!user) {
    return null
  }

  const closeUserEdit = () => {
    setEditUser(false)
  }

  const showCredentials = !!([USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR].includes(user.user_type))

  const logoLink = user.user_type === USER_TYPES.CLIENT ? '#' : '/'
  const logoTarget = user.user_type === USER_TYPES.CLIENT ? '' : '_blank'

  return (
    <Navbar className="py-4 pl-5 global-header no-print" bg="danger">
      <Navbar.Brand href="#home">
        <Link to={logoLink} target={logoTarget} id="header-logo">
          {user.logo
            ? <Image className="header-logo" src={static_root+user.logo} />
            : <label className="mb-0 h3 text-white">HeyJoe</label>
          }
        </Link>
      </Navbar.Brand>
      <h3 id="header-title">
      </h3>
      <button
        className="ml-auto h5 mr-0 btn btn-danger mt-2"
        title='Ask a question to support'
        onClick={() => {
          injectIntercom(user)
        }}
      >
        <BiSupport size={30} />
      </button>
      <Dropdown className="ml-0 header-user-menu" alignRight>
        <Dropdown.Toggle variant="danger" id="dropdown-basic">
          {/* <Image src="https://loremflickr.com/50/50" roundedCircle /> */}
          <span className="ml-2 h5">
            <FaUser />
          </span>
          {needCredentials &&
          <FaInfoCircle
            color="white"
            size="22"
            className="mt-n1 ml-2 fade-alert"
            title="Credentials are required"
          />}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item className="text-secondary">
            {user.email}<br/>
            {user.user_type}
          </Dropdown.Item>
          {[USER_TYPES.SESSION_MANAGER, USER_TYPES.SUPER_ADMIN].includes(user.user_type) && (
            <Dropdown.Item onClick={() => {
              history.push('/freelancer-profile')
            }}>
              Freelancer Profile
            </Dropdown.Item>
          )}
          <Dropdown.Item onClick={() => {
            setEditUser(!editUser)
          }}>
            Credentials
            {needCredentials &&
            <FaInfoCircle
              color="red"
              size="18"
              className="mt-n1 ml-2 fade-alert"
              title="Credentials are required"
            />}
          </Dropdown.Item>
          <Dropdown.Item onClick={() => {
            window.localStorage.removeItem('token')
            window.location.reload(true)
          }} className="d-flex">
            Logout
            <small className='ml-auto'>
              { VERSION }
            </small>
          </Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>

      <Modal
        show={!!editUser}
        onHide = {closeUserEdit}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            Edit User {showCredentials ? 'Credentials / ': ''} Logo
          </h5>
        </Modal.Header>
        <Modal.Body>
          <UserForm
            key={editUser}
            onClose={closeUserEdit}
          />
        </Modal.Body>
      </Modal>
    </Navbar>
  )
}

export default withRouter(Header)
