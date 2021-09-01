import React, { useEffect, useState, useRef } from 'react'
import { Modal, Image, Accordion  } from 'react-bootstrap'
import { FaPlus, FaTrash, FaPencilAlt } from 'react-icons/fa';
import { Editor } from '@tinymce/tinymce-react'
import {
  static_root,
  listUsers,
  register,
  updateUserFields,
  deleteUser,
  getNotification,
  updateNotification
} from '../../services'
import UserForm from './UserForm'
import { USER_TYPES, TINYMCE_KEY } from '../../constants'
import './style.scss'

let delayHandle = null

const Admin = () => {
  const [users, setUsers] = useState([])
  const [query, setQuery] = useState('')
  const [userToDelete, setUserToDelete] = useState(null)
  const [page, setPage] = useState(0)
  const [count, setCount] = useState(0)
  const [selectedUser, setSelectedUser] = useState(null)
  const [notification, setNotification] = useState({})
  const [showNotification, setShowNotification] = useState('')
  const editorRef = useRef(null)
  const perPage = 20

  const load = async () => {
    document.querySelector('.loading').classList.add('show')
    const response = await listUsers(query, page * perPage, perPage)
    setUsers(response.users)
    setCount(response.count)
    let n = await getNotification()
    n = n || {}
    setNotification(n)
    document.querySelector('.loading').classList.remove('show')
  }

  useEffect(() => {
    load()
  }, [page])

  useEffect(() => {
    if (delayHandle) { clearTimeout(delayHandle) }
    if (delayHandle || query) {
      delayHandle = setTimeout(async () => {
        if (page === 0) { load() }
        else { setPage(0) }
      }, 800)
    }
  }, [query])

  let pages = []
  for(let i = 0; i < Math.ceil(count / perPage); i ++) {
    pages.push(i)
  }

  const closeUserEdit = () => {
    setSelectedUser(null)
  }
  const closeNotification = () => {
    setShowNotification('')
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

  const noticeTitle = showNotification && showNotification.split('_').map(n => n[0].toUpperCase() + n.slice(1)).join(' ')

  return (
    <div className="p-5 page-content">
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
              setShowNotification('client_notice')
            }}
          >Set Client Notice</button>
        </div>
        <div className="d-flex ml-2">
          <button
            className="btn btn-primary mr-2 d-flex align-items-center"
            onClick={() => {
              setShowNotification('casting_director_notice')
            }}
          >Set Casting Director Notice</button>
        </div>
        <div className="d-flex ml-2">
          <button
            className="btn btn-primary mr-2 d-flex align-items-center"
            onClick={() => {
              setShowNotification('session_manager_notice')
            }}
          >Set Session Manager Notice</button>
        </div>
        <div className="d-flex ml-2">
          <button
            className="btn btn-primary mr-2 d-flex align-items-center"
            onClick={() => {
              setShowNotification('notification')
            }}
          >Set Global Notification Content</button>
        </div>
        <div className="d-flex ml-2">
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
                <div className="row py-2 align-items-center user-item" >
                  <div className="col-3">
                    <h5 className="ml-3 mb-0">{user.email}</h5>
                  </div>
                  <div className="col col-1">
                    {user.first_name} {user.last_name}
                  </div>
                  <div className="col-2">
                    {user.user_type}
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
        {pages.map(p => {
          return <label className={`mx-3 page-item ${page === p?'active':''}`} key={p} onClick={() => {
            setPage(p)
          }}>{p + 1}</label>
        })}
      </div>
      <Modal
        show={!!showNotification}
        onHide = {closeNotification}
        size="xl"
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            Set {noticeTitle}
          </h5>
        </Modal.Header>
        <Modal.Body>
          <Editor
            apiKey={TINYMCE_KEY}
            onInit={(evt, editor) => editorRef.current = editor}
            initialValue={notification[showNotification]}
            init={{
              height: '65vh',
              menubar: false,
              plugins: [
                'advlist autolink lists link image charmap print preview anchor',
                'searchreplace visualblocks code fullscreen',
                'insertdatetime media table paste code help wordcount'
              ],
              toolbar: 'undo redo | formatselect | ' +
              'bold italic backcolor | alignleft aligncenter ' +
              'alignright alignjustify | bullist numlist outdent indent | ' +
              'removeformat | help',
              content_style: 'body { font-family:Helvetica,Arial,sans-serif; font-size:14px }'
            }}
          />
          <div className="mt-2">
            <button
              className="btn btn-primary"
              onClick={async () => {
                const n = editorRef.current.getContent()
                updateNotification({ [showNotification]: n })
                setNotification({ ...notification, [showNotification]: n })
                setShowNotification(false)
              }}
            >
              Save
            </button>
            <button
              className="btn btn-text ml-2"
              onClick={() => {
                setShowNotification(false)
              }}
            >
              Cancel
            </button>
          </div>
        </Modal.Body>
      </Modal>
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
