import React, {
  useContext,
  useEffect,
  useState,
  useCallback,
} from 'react'

import {
  useSelector,
  useDispatch,
} from 'react-redux'

import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import clsx from 'classnames'
import { Link } from 'react-router-dom'
import { 
  Modal
} from 'react-bootstrap'

import {
  FaPen,
  FaLink,
  FaBackward,
  FaArchive,
  FaTrash,
  FaListAlt,
  FaFilm,
  FaUsers,
  FaSearch,
} from 'react-icons/fa';
import { IoMdVideocam } from 'react-icons/io'
import { AiOutlineOrderedList } from 'react-icons/ai'
import { HiOutlineMail } from 'react-icons/hi'
import moment from 'moment'
import {
  static_root,
  assignCastingDirector,
  searchUsers,
  deleteStudio,
  getPagesByStudio,
  updatePage,
  createPage,
  deletePage,
  createSession,
  updateSession,
  deleteSession,
  archiveStudio,
  unArchiveStudio,
} from '../../services'
import { ShowLoadingContext } from '../../Context'
import './style.scss'

export default ({studio, postingPage}) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [confirmMessage, setConfirmMessage] = useState(null)
  const [confirmCallback, setConfirmCallback] = useState(null)
  const [name, setName] = useState('')
  const toggleLoading = useContext(ShowLoadingContext)

  const handleDelete = async (postingPage, studio_id) => {
    const callback = async () => {
      await deletePage(postingPage._id)
    }
    setConfirmMessage(`Want to delete ${postingPage.name}?`)
    setConfirmCallback(() => callback)
  }
  const handlePostingPageSubmit = async (postingPage={}, studio_id) => {
    toggleLoading(true)
    toggleLoading(false)
  }
  return (
    <div key={postingPage._id} className="row mt-1 ml-2 mr-2">
      <div className="col-2">
        {postingPage.name}
      </div>
      <div className="col-auto">
        <Link to={`/posting-page/${studio.uri}/${postingPage._id}`} className="text-danger" target="_blank">
          View Posting Page
        </Link>
      </div>
      <div className="col-auto action-wrap">
        <FaPen
          className="mr-2"
          onClick={() => {setShowEditModal(true)}}/>
        <FaTrash onClick={() => handleDelete(postingPage, studio._id)}/>
      </div>
      <Modal
        show={showEditModal}
        onHide={() => {setShowEditModal(false)}}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            Update {postingPage.name}
          </h4>
        </Modal.Header>
        <Modal.Body>
          <input
            type="text"
            className="form-control mb-3"
            value={postingPage.name}
            onChange={ev => {setName(ev.target.name)}}
          />
        </Modal.Body>
        <Modal.Footer>
          <button
            disabled={!!name}
            className="btn btn-primary"
            onClick={() => {
              handlePostingPageSubmit(postingPage, studio._id)
            }}
          >
            Submit
          </button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}