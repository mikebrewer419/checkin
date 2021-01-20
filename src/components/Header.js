import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Dropdown, Navbar, Image, Modal } from 'react-bootstrap'
import { FaInfoCircle } from 'react-icons/fa';
import { getUser, getUserById, static_root } from '../services'
import UserForm from './userForm'
import { USER_TYPES } from '../constants'
import './Header.scss'

const excludePaths = [
  '/onboard'
]

const Header = (props) => {
  const [user, setUser] = useState(null)
  const [editUser, setEditUser] = useState(false)
  const [needCredentials, setNeedCredentials] = useState(false)

  useEffect(() => {
    const u = getUser()
    setUser(u)
    if (!u) return
    getUserById(u.id).then(data => {
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

  return (
    <Navbar className="py-4 px-5 global-header no-print" bg="danger">
      <Navbar.Brand href="#home" className="my-n4">
        <Link to="/" target="_blank" id="header-logo">
          {user.logo
            ? <Image className="mt-n2 header-logo" src={static_root+user.logo} />
            : <label className="mb-0 h3 text-white">HeyJoe</label>
          }
        </Link>
      </Navbar.Brand>
      <Dropdown className="ml-auto">
        <Dropdown.Toggle variant="danger" id="dropdown-basic">
          {/* <Image src="https://loremflickr.com/50/50" roundedCircle /> */}
          <span className="ml-2 h5">{user.email}</span>
          {needCredentials &&
          <FaInfoCircle
            color="white"
            size="22"
            className="mt-n1 ml-2 fade-alert"
            title="Credentials are required"
          />}
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item className="text-secondary">{user.user_type}</Dropdown.Item>
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
          }}>Logout</Dropdown.Item>
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
