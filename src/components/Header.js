import React from 'react'
import { withRouter } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { Dropdown, Navbar, Image, NavDropdown } from 'react-bootstrap'
import { getUser } from '../services/auth'
import './Header.scss'

const user = getUser()
const excludePaths = [
  '/onboard'
]

const Header = (props) => {
  console.log("Header -> match", props)

  if (excludePaths.find(path => props.location.pathname.startsWith(path))) {
    return null
  }

  if (!user) {
    return null
  }

  return (
    <Navbar className="py-4 px-5" bg="danger">
      <Navbar.Brand href="#home" className="my-n4">
        <Link to="/">
          {/* <Image src="https://loremflickr.com/140/80" /> */}
          <label className="mb-0 h1 text-white">HeyJoe</label>
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
            window.localStorage.removeItem('token')
            window.location.reload(true)
          }}>Logout</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Navbar>
  )
}

export default withRouter(Header)
