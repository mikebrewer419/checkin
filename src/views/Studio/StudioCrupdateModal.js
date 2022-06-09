import React, {
  useRef,
  useState,
} from 'react'

import {
  useDispatch
} from 'react-redux'
import {
  Modal,
  Form,
  Container,
  Row,
  Col,
  Button,
} from 'react-bootstrap'

import {
  FaPen
} from 'react-icons/fa'

import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import 'react-bootstrap-typeahead/css/Typeahead.css';
import clsx from 'classnames'
import {
  PROJECT_TYPES,
  USER_TYPES,
  USER_TYPE
} from '../../constants'

import {
  searchUsers,
  createStudio,
  updateStudio,
  getManyStudios,
} from '../../services'

import {
  set as setStudiosInStore,
  update as updateStudioInStore,
} from '../../store/studios'

export default function ({
  studio,
  show,
  onHide,
}) {
  const [showDetails, setShowDetails] = useState(false);
  const [selectedCastingDirector, setSelectedCastingDirector] = useState(studio ? studio.casting_directors : []);
  const [castingDirectors, setCastingDirectors] = useState([]);
  const [loadingSessionUsers, setLoadingSessionUsers] = useState(false);
  const [errors, setErrors] = useState({});
  const [showAuditionPurchaseMsg, setShowAuditionPurchaseMsg] = useState(studio && studio.type === PROJECT_TYPES.CREATOR);
  const dispatch = useDispatch()

  const initialData = !!studio ? studio : {};

  const searchCastingDirectors = async (email) => {
    setLoadingSessionUsers(true);
    const users = await searchUsers(email, USER_TYPES.CASTING_DIRECTOR);
    setCastingDirectors(users);
    setLoadingSessionUsers(false);
  };

  const onSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    if(selectedCastingDirector.length > 0) {
      formData.append('casting_directors', selectedCastingDirector.map(it=>it._id))
    }
    if (!!studio._id) {
      updateStudio(formData, studio._id).then(res => {
        
        dispatch(updateStudioInStore(res))
      }).catch(err => {
        console.log(err);
      });
    } else {
      createStudio(formData).then(res => {
        getManyStudios(0, 10).then(res=>{
          dispatch(setStudiosInStore(res))
        })
      }).catch(err => {
        console.log(err);
      });
    }
    onHide();
  };
 
  return (
    <Modal
      dialogClassName={clsx({ "fullscreen-modal": showDetails })}
      show={show}
      onHide={onHide}
    >
      <Form
        className="d-flex flex-column h-100"        
        onSubmit={onSubmit}
      >
        <Modal.Header closeButton className="align-items-baseline">
          <h4 className="mb-0 mr-3">
            {(studio && studio._id) ? `Update ${studio.name}` : 'Create New Project'}
            {!studio && showDetails && (
              <p className="h6 font-weight-normal mt-1">
                Please make sure all credentials are preperly configured for your account.
              </p>
            )}

          </h4>
          {studio && studio.casting_directors && studio.casting_directors.length > 0 && (
            <label className="mb-0">
              <span className="mr-1">Director: </span>
              {studio.casting_directors.map(director => director.email).join(',')}
            </label>
          )}
        </Modal.Header>
        <Modal.Body className="overflow-auto">
        
          {!showDetails && (
            <>
              <div className='d-flex align-items-center mb-3'>
                <strong>Project Name</strong>
                <div className='mx-2 flex-fill'>
                  <Form.Control
                    required
                    type="text"
                    name="name"
                    defaultValue={initialData.name || ''} />
                </div>
                <div
                  className="d-flex cursor-pointer align-items-center"
                  onClick={() => { setShowDetails(true); } }
                >
                  <span className='mr-2'>Advanced Details</span>
                  <FaPen />
                </div>
              </div>
              {USER_TYPE.IS_SUPER_ADMIN() && (
                <Form.Group className="my-3">
                  <Form.Label>Assign casting directors</Form.Label>
                  <AsyncTypeahead
                    id="casting-director-email"
                    selected={selectedCastingDirector}
                    onChange={value => {
                      setSelectedCastingDirector(value);
                    } }
                    isLoading={loadingSessionUsers}
                    labelKey="email"
                    minLength={2}
                    onSearch={searchCastingDirectors}
                    options={castingDirectors}
                    placeholder="Search for a Session user..."
                    name="casting_directors" />
                </Form.Group>
              )}
            </>
          )}
          <Container
            fluid
            className={clsx({ "d-none": !showDetails })}
          >
            <Row>
              {showDetails && (
                <Col>
                  <Form.Group>
                    <Form.Label>Project Name</Form.Label>
                    <Form.Control
                      size="sm"
                      required
                      type="text"
                      name="name"
                      defaultValue={initialData.name || ''} />
                  </Form.Group>
                </Col>
              )}
              <Col>
                <Form.Group>
                  <Form.Label>Uri</Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="text"
                    name="uri"
                    defaultValue={initialData.uri || ''} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Meeting ID</Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    id="jitsi_meeting_id"
                    type="text"
                    name="jitsi_meeting_id"
                    defaultValue={initialData.jitsi_meeting_id || ''} />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group>
                  <Form.Label>Test Meeting ID</Form.Label>
                  <Form.Control
                    required
                    size="sm"
                    type="text"
                    name="test_meeting_id"
                    defaultValue={initialData.test_meeting_id || ''} />
                </Form.Group>
              </Col>
            </Row>
            {USER_TYPE.IS_SUPER_ADMIN() && showDetails && (
              <Form.Group className="my-3">
                <Form.Label>Assign casting directors</Form.Label>
                <AsyncTypeahead
                  id="casting-director-email"
                  selected={selectedCastingDirector}
                  onChange={value => {
                    setSelectedCastingDirector(value);
                  } }
                  isLoading={loadingSessionUsers}
                  labelKey="email"
                  minLength={2}
                  onSearch={searchCastingDirectors}
                  options={castingDirectors}
                  placeholder="Search for a Session user..."
                  name="casting_directors" />
              </Form.Group>
            )}
            <Form.Group>
              <Form.Label>Thankyou_message</Form.Label>
              <Form.Control
                required
                size="sm"
                type="text"
                name="thankyou_message"
                defaultValue={initialData.thankyou_message || `Thank you for checking in to PROJECT_NAME. To join virtual lobby click TALENT_STATUS_LINK or enter TEST_MEETING_ID into the app. You may use this link on any device`} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Position_messages 1</Form.Label>
              <Form.Control
                required
                size="sm"
                type="text"
                name="position_messages"
                defaultValue={(initialData.position_messages && initialData.position_messages[0]) || `It's now your turn to audition, please click the TALENT_STATUS_LINK or enter MEETING_ID into the app. ***IMPORTANT: Click Ask to Join.`} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Position_messages 2</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                name="position_messages"
                defaultValue={(initialData.position_messages && initialData.position_messages[1]) || ''} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Position_messages 3</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                name="position_messages"
                defaultValue={(initialData.position_messages && initialData.position_messages[2]) || ''} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Position_messages 4</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                name="position_messages"
                defaultValue={(initialData.position_messages && initialData.position_messages[3]) || ``} />
            </Form.Group>
            <Form.Group>
              <Form.Label>Good bye message</Form.Label>
              <Form.Control
                size="sm"
                type="text"
                name="good_bye_message"
                defaultValue={initialData.good_bye_message || ''} />
            </Form.Group>
            <Form.Group>
              <Form.Check
                label="Creator Project"
                name="project_type"
                value={PROJECT_TYPES.CREATOR}
                defaultChecked={initialData.type === PROJECT_TYPES.CREATOR}
                onChange={(ev) => {
                  setShowAuditionPurchaseMsg(ev.target.checked);
                } } />
            </Form.Group>
            {showAuditionPurchaseMsg && (
              <Form.Group>
                <Form.Label>Audition Purchase Message</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  name="audition_purchase_message"
                  defaultValue={initialData.audition_purchase_message || `Thank you for auditioning for PROJECT_NAME. Get a link to your audition footage to save and share : LINK_TO_PURCHASE_INVOICE`} />
              </Form.Group>
            )}
            <Form.Group>
              <Form.Label>Logo</Form.Label>
              <Form.Control
                type="file"
                name="logo"
                accept=".png, .jpg, .jpeg" />
            </Form.Group>
            <Form.Group>
              {errors.uri &&
                <p className="text-danger mb-1">Studio uri <strong>{errors.uri}</strong> already used!</p>}
              {errors.meeting_id &&
                <p className="text-danger mb-1">Meeting id <strong>{errors.meeting_id}</strong> already used!</p>}
            </Form.Group>
          </Container>
        </Modal.Body>
        <Modal.Footer>
          <Button
            type="submit"
            variant="primary"
          >
            {(studio && studio._id) ? 'Update' : 'Create'}
          </Button>
          <Button
            variant="secondary"
            className="ml-3"
            onClick={onHide}
          >
            Cancel
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}