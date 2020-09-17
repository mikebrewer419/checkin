import React, { useState, useEffect } from 'react'
import { withRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Dropdown, Navbar, Image, Modal } from 'react-bootstrap'
import { getUser } from '../services/auth'
import { static_root } from '../services'
import UserForm from './userForm'
import './Header.scss'

const excludePaths = [
  '/onboard'
]

const Header = (props) => {
  const [user, setUser] = useState(null)
  const [editUser, setEditUser] = useState(false)

  useEffect(() => {
    setUser(getUser())
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

  return (
    <Navbar className="py-4 px-5 global-header" bg="danger">
      <Navbar.Brand href="#home" className="my-n4">
        <Link to="/" target="_blank">
          {user.logo
            ? <Image className="mt-n2" height="65" src={static_root+user.logo} />
            : <label className="mb-0 h3 text-white">HeyJoe</label>
          }
        </Link>
      </Navbar.Brand>
      <Dropdown className="ml-auto">
        <Dropdown.Toggle variant="danger" id="dropdown-basic">
          {/* <Image src="https://loremflickr.com/50/50" roundedCircle /> */}
          <span className="ml-4 h5">{user.email}</span>
        </Dropdown.Toggle>

        <Dropdown.Menu>
          <Dropdown.Item className="text-secondary">{user.user_type}</Dropdown.Item>
          <Dropdown.Item onClick={() => {
            setEditUser(!editUser)
          }}>
            Credentials
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
            Edit User Credentials / Logo
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
