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
import {
  Button,
  Form
} from 'react-bootstrap'
import {
  FaPlus,
} from 'react-icons/fa';
import {
  getManyStudios,
  generateNewJitsiKey,
  generateNewProjectUri,
} from '../../services'
import './style.scss'
import Footer from '../../components/Footer'
import {
  STUDIO_LIST_PERMISSIONS,
} from '../../constants'
import 'react-bootstrap-typeahead/css/Typeahead.css';
import Pagination from '../../components/Pagination'
import StudioCrupdateModal from './StudioCrupdateModal';
import Studio from './Studio'

import { set as setStudios } from '../../store/studios'

const host = window.location.origin

const PAGE_SIZE = 10
const StudioList = () => {
  const [searchKey, setSearchKey] = useState('')
  const [page, setPage] = useState(0)
  const [archive, setArvhice] = useState(false)
  const [newStudioInfo, setNewStudioInfo] = useState(null)
  const studios = useSelector(state=>state.studios)
  const dispatch = useDispatch()
  
  const fetchManyStudios = useCallback (() => {
    getManyStudios(page, PAGE_SIZE, searchKey, archive).then(res=>{
      dispatch(setStudios(res))
    })
  }, [page, searchKey, archive])

  useEffect(() => {
    document.title = `Hey Joe - Virtual Casting Studio and Auditioning Platform`;
  }, [])

  useEffect(() => {
    fetchManyStudios()
  }, [fetchManyStudios])

  const onCreateProjectBtnClick = async () => {
    const {jitsi_meeting_id} = await generateNewJitsiKey()
    const { jitsi_meeting_id:test_meeting_id} = await generateNewJitsiKey()
    const {project_uri} = await generateNewProjectUri()
    setNewStudioInfo({
      jitsi_meeting_id,
      test_meeting_id,
      uri: project_uri
    })
    
  }
  console.log(studios)
  return (
    <div className="p-5 w-100 studios-list">
      <div className="d-flex align-items-center justify-content-between mb-5">
        <div className="d-flex align-items-center">
          <h1 className="my-0">
            Projects
          </h1>
          <Form.Control
            className="ml-5"
            placeholder="Project name"
            value={searchKey}
            onChange={ev => setSearchKey(ev.target.value)}
          />
          <Form.Check
            className="ml-4 text-nowrap"
            onChange={(ev) => {setArvhice(ev.target.checked)}}
            label="Show Archive"
          />
        </div>
        <div className="d-flex">
          {STUDIO_LIST_PERMISSIONS.CAN_CREATE_STUDIO() && (
            <Button
              type="button"
              onClick={onCreateProjectBtnClick}
            >
              <FaPlus className="mr-2"/>
              Create Project
            </Button>
          )}
        </div>
      </div>
      <div className="list-group mb-4">
        {studios.studios.map(studio => (
          <Studio studio={studio} />
        ))}
      </div>
      <Pagination
        page={page}
        setPage={setPage}
        pageCount={Math.ceil(+studios.count / PAGE_SIZE)}
      />
      <StudioCrupdateModal
        show={!!newStudioInfo}
        studio={newStudioInfo}
        onHide={()=>setNewStudioInfo(null)}
      />
      <Footer/>
    </div>
  )
}

export default StudioList
