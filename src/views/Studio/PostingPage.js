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
  Button,
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

import { update as updateStudioInStore} from '../../store/studios'

import './style.scss'
import PostingPageCrupdateModal from './PostingPageCrupdateModal'

export default ({studio, postingPage}) => {
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteConfirmModal, setShowDeleteConfirmModal] = useState(false)
  const dispatch = useDispatch()
  
  const onConfirmDelete = () => {
    deletePage(postingPage._id).then(res=>{
      const idx = studio.postingPages.findIndex(it=>it._id == res._id)
      const postingPages = [...studio.postingPages]
      postingPages.splice(idx, 1)
      const temp = {...studio}
      temp.postingPages = postingPages
      dispatch(updateStudioInStore(temp))
      setShowDeleteConfirmModal(false)
    })
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
        <FaTrash onClick={() => {setShowDeleteConfirmModal(true)}}/>
      </div>
      <PostingPageCrupdateModal
        show={showEditModal}
        onHide={()=>{setShowEditModal(false)}}
        postingPage={postingPage}
        studio={studio}
      />
      <Modal
        show={showDeleteConfirmModal}
        onHide={()=>{setShowDeleteConfirmModal(false)}}
      >
        <Modal.Header>
          <h4>Want to delete Posing Page "{postingPage.name}"</h4>
        </Modal.Header>
        <Modal.Footer>
          <Button
            className="btn-w-md"
            variant="danger"
            onClick={onConfirmDelete}
          >
            Yes
          </Button>
          <Button
            variant="light"
            className="btn-w-md"
            onClick={()=>{setShowDeleteConfirmModal(false)}}
          >
            Cancel
          </Button>
        </Modal.Footer>

      </Modal>
    </div>
  )
}