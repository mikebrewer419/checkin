import React, {
    useState,
    useEffect
} from 'react'

import {
  Button,
  Accordion,
  Image,
  Modal
} from 'react-bootstrap'

import {
  FaPlus,
  FaPencilAlt,
  FaTrash
} from 'react-icons/fa'

import {
  static_root,
  listUsers,
  register,
  updateUserFields,
  deleteUser,
} from '../../../services'

import {
  USER_TYPES,
  USER_TYPE_TEXT
} from '../../../constants'

import UserForm from '../UserForm'


let delayHandle = null

const UsersTab = () => {
  const [users, setUsers] = useState([])
  
  const [query, setQuery] = useState('')
  const [userToDelete, setUserToDelete] = useState(null)
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [userType, setUserType] = useState('')
  const perPage = 20

  const load = async () => {
    document.querySelector('.loading').classList.add('show')
    const response = await listUsers(query, userType, page * perPage, perPage)
    setUsers(response.users)
    setCount(response.count)
    document.querySelector('.loading').classList.remove('show')
  }

  useEffect(() => {
    load()
  }, [page, userType])

  useEffect(() => {
    if (delayHandle) { clearTimeout(delayHandle) }
    if (delayHandle || query) {
      delayHandle = setTimeout(async () => {
        if (page === 0) { load() }
        else { setPage(0) }
      }, 800)
    }
  }, [query, userType])

  
  let pages = []
  const pageCount = Math.ceil(count / perPage)
  for(let i = 0; i < pageCount; i ++) {
    pages.push(i)
  }

  const closeUserEdit = () => {
    setSelectedUser(null)
  }
  

  const submitUser = async (data) => {
    if (selectedUser._id) {
      await updateUserFields(selectedUser._id, data)
    } else {
      await register(data)
    }
    await setSelectedUser(null)
    load()
  }

  const userDeleteConfirm = async () => {
    await deleteUser(userToDelete._id)
    await setUserToDelete(null)
    load()
  }

  const closeUserDelete = () => {
    setUserToDelete(null)
  }
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className='d-flex'>
          <input
            className="form-control mr-2"
            value={query}
            onChange={ev => setQuery(ev.target.value)}
            placeholder="Search with Email"
          />
          <select
            className='form-control'
            value={userType}
            onChange={ev => {
              setUserType(ev.target.value)
            }}
          >
            <option value="">All</option>
            { Object.values(USER_TYPES).map(user_type => {
              return <option key={user_type} value={user_type}>
                { USER_TYPE_TEXT[user_type] }
              </option>
            }) }
          </select>
        </div>
        <Button
          type="button"
          variant="primary"
          onClick={() => {
            setSelectedUser({})
          }}
        >
          <FaPlus className="mr-2"/>Create New User
        </Button>
        
      </div>
      <div>
        <Accordion className="list-group hover-highlight">
          {users.map(user => (
            <div key={user._id}>
              <Accordion.Toggle as="div" eventKey={user._id}>
                <div className="row py-2 align-items-center user-item" >
                  <div className="col-3">
                    <h5 className="ml-3 mb-0">{user.email}</h5>
                  </div>
                  <div className="col col-1">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="col-2">
                    {USER_TYPE_TEXT[user.user_type]}
                  </div>
                  <div className="col-auto ml-auto mr-3 user-action">
                    <FaPencilAlt
                      className="mr-3 cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation()
                        setSelectedUser(user)
                      }}
                    />
                    <FaTrash
                      className="cursor-pointer"
                      onClick={(event) => {
                        event.stopPropagation()
                      setUserToDelete(user)
                    }} />
                  </div>
                </div>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey={user._id}>
                <div className="row px-5 py-3">
                  {user.logo ?
                  <div className="col-auto">
                    <Image height="105" src={static_root+user.logo} />
                  </div> : <span className="mr-5">No Logo</span>}
                  <div className="col">
                    {[USER_TYPES.SUPER_ADMIN, USER_TYPES.CASTING_DIRECTOR].includes(user.user_type) &&
                    <table>
                      <tbody>
                        <tr>
                          <td>twilio_account_sid: </td>
                          <td><strong>{user.twilio_account_sid}</strong></td>
                        </tr>
                        <tr>
                          <td>twilio_auth_token: </td>
                          <td><strong>{user.twilio_auth_token}</strong></td>
                        </tr>
                        <tr>
                          <td>twilio_from_number: </td>
                          <td><strong>{user.twilio_from_number}</strong></td>
                        </tr>
                        <tr>
                          <td>comet_chat_appid: </td>
                          <td><strong>{user.comet_chat_appid}</strong></td>
                        </tr>
                        <tr>
                          <td>comet_chat_auth: </td>
                          <td><strong>{user.comet_chat_auth}</strong></td>
                        </tr>
                        <tr>
                          <td>comet_api_key: </td>
                          <td><strong>{user.comet_api_key}</strong></td>
                        </tr>
                        {[USER_TYPES.CASTING_DIRECTOR].includes(user.user_type) && (
                          <tr>
                            <td>business_id</td>
                            <td><strong>{user.business_id}</strong></td>
                          </tr>
                        )}
                      </tbody>
                    </table>}
                  </div>
                </div>
              </Accordion.Collapse>
            </div>
          ))}
        </Accordion>
      </div>
      <div className="text-center mt-3">
        <ul className="mb-0 d-inline-flex pagination">
          <li onClick={() => setPage(Math.max(page - 1, 0))}>
            {'<'}
          </li>
          <li className="mx-2">
            Page 
            <select className="page-select ml-2 mr-1" onChange={ev => {
              setPage(parseInt(ev.target.value))
            }}>
              {new Array(pageCount).fill().map((_, idx) => {
                return (
                  <option
                    key={idx}
                    value={idx}
                    selected={idx === page}
                  >
                    { idx + 1}
                  </option>
                )
              })}
            </select>
              /
            <span className="ml-1">
              {pageCount}
            </span>
          </li>
          <li onClick={() => setPage(Math.min(page + 1, pageCount - 1))}>
            {'>'}
          </li>
        </ul>
      </div>
      <Modal
        show={!!selectedUser}
        onHide = {closeUserEdit}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            {selectedUser && selectedUser._id ? 'Edit User' : 'Create User'}
          </h5>
        </Modal.Header>
        <Modal.Body>
          <UserForm
            user={selectedUser}
            onClose={closeUserEdit}
            onSubmit={submitUser}
          />
        </Modal.Body>
      </Modal>
      <Modal
        show={!!userToDelete}
        onHide = {closeUserDelete}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            Do you really want to delete {userToDelete && userToDelete.email}?
          </h5>
        </Modal.Header>
        <Modal.Body>
          <h4 className="text-danger">This action cannot be reversed!</h4>
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn btn-danger"
            onClick={userDeleteConfirm}
          >Yes.</button>
          <button
            className="btn btn-link"
            onClick={closeUserDelete}
          >No</button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}

export default UsersTab