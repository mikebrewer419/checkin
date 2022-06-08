import React from 'react'
import {
  useSelector,
  useDispatch,
} from 'react-redux'
import {
  Modal,
  Button,
  Form
} from "react-bootstrap"

import _ from 'lodash'
import {
  createPage,
  updatePage
} from '../../services'

import {
  update as updateStudioInStore,
} from '../../store/studios'

export default ({
  postingPage,
  studio,
  show,
  onHide,
}) => {
  const dispatch = useDispatch()
  const studios = useSelector(state=>state.studios)
  const onSubmit = (e)=>{
    e.preventDefault()
    const formData = new FormData(e.target)
    if (postingPage) {
      updatePage(postingPage._id, formData).then(res=>{
        const studio = { ...studios.studios.find(it=>it._id == res.studio) }
        const idx = studio.postingPages.findIndex(it=>it._id == res._id)
        const postingPages = [...studio.postingPages]
        postingPages[idx] = res
        studio.postingPages = postingPages
        dispatch(updateStudioInStore(studio))
      })
    } else {
      formData.append('studio', studio._id)
      createPage(formData).then(res=>{
        const studio = { ...studios.studios.find(it=>it._id == res.studio) }
        const postingPages = [...studio.postingPages, res]
        studio.postingPages = postingPages
        dispatch(updateStudioInStore(studio))
      })
    }
    onHide()
  }
  
  return (
    <Modal
      show={show}
      onHide={onHide}
    >
      <Form onSubmit={onSubmit}>
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            {postingPage ? `Update ${postingPage.name}`: 'Create New Posting Page'}
          </h4>
        </Modal.Header>
      
        <Modal.Body>
          <Form.Control
            type="text"
            className="form-control mb-3"
            name="name"
            defaultValue={_.get(postingPage, 'name', '')}
            required
          />
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="submit"
          >
            Submit
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  )
}