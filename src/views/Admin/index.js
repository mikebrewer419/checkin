import React, { useEffect, useState } from 'react'
import { Modal, Image, Accordion  } from 'react-bootstrap'
import { FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';
import {
  static_root,
  listUsers,
  register,
  updateUserFields,
  deleteUser
} from '../../services'
import UserForm from './UserForm'
import './style.scss'

const Admin = () => {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [userToDelete, setUserToDelete] = useState(null)
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const perPage = 30

  useEffect(() => {
    const load = async () => {
      const response = await listUsers(query, page * perPage, perPage)
      setUsers(response.users)
      setCount(response.count)
    }
    load()
  }, [query, selectedUser, userToDelete])

  let pages = []
  for(let i = 0; i <= count / perPage; i ++) {
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
    setSelectedUser(null)
  }

  const userDeleteConfirm = async () => {
    await deleteUser(userToDelete._id)
    setUserToDelete(null)
  }

  const closeUserDelete = () => {
    setUserToDelete(null)
  }

  return (
    <div className="p-5">
      <div className="d-flex align-items-center mb-3">
        <div>
          <input
            className="form-control"
            value={query}
            onChange={ev => setQuery(ev.target.value)}
            placeholder="Search with Email"
          />
        </div>
        <div className="d-flex ml-auto">
          <button
            className="btn btn-primary mr-2 d-flex align-items-center"
            onClick={() => {
              setSelectedUser({})
            }}
          ><FaPlus className="mr-2"/>Create New User</button>
        </div>
      </div>
      <div>
        <Accordion className="list-group">
          {users.map(user => (
            <div key={user._id}>
              <Accordion.Toggle as="div" eventKey={user._id}>
                <div className="row py-2 align-items-center" >
                  <div className="col-2">
                    <h5 className="ml-3 mb-0">{user.email}</h5>
                  </div>
                  <div className="col-2">
                    {user.user_type}
                  </div>
                </div>
              </Accordion.Toggle>
              <Accordion.Collapse eventKey={user._id}>
                <div className="row px-5 py-3">
                  <div className="col-auto">
                    <Image height="105" src={user.logo ? static_root+user.logo : `https://loremflickr.com/240/240/anime?random=${user.email}`} />
                  </div>
                  <div className="col">
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
                      </tbody>
                    </table>
                  </div>
                  <div className="col-auto">
                    <FaPencilAlt
                      className="mr-3"
                      onClick={() => {
                        setSelectedUser(user)
                      }}
                    />
                    <FaTrash onClick={() => {
                      setUserToDelete(user)
                    }} />
                  </div>
                </div>
              </Accordion.Collapse>
            </div>
          ))}
        </Accordion>
      </div>
      <div className="text-center mt-3">
        {pages.map(page => {
          return <label key={page} onClick={() => {
            setPage(page)
          }}>{page + 1}</label>
        })}
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

export default Admin
