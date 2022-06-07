import React from 'react'
import {
  Modal,
  Button,
  Form
} from "react-bootstrap"

export default ({
  postingPage,
  show,
  onHide,
}) => {
  return (
    <Modal
      show={show}
      onHide={onHide}
    >
      <Modal.Header closeButton className="align-items-baseline">
        <h4 className="mb-0 mr-3">
          {postingPage ? `Update ${postingPage.name}`: 'Create New Posting Page'}
        </h4>
      </Modal.Header>
      <Form>
        <Modal.Body>
          <Form.Control
            type="text"
            className="form-control mb-3"
            defaultValue={postingPage ? postingPage.name : ''}
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