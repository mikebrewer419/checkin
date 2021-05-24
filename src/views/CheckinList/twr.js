import React from 'react'
import { Modal } from 'react-bootstrap'
import Switch from "react-switch"
import {
  twrFetchCheckInList,
  twrGetStudioByTWRUri,
  twrGetHeyjoeSessionRecords,
  twrGetTWRByDomain,
  getcurrentTWRGroup,
  addRecordToCurentTWRGroup,
  removeRecordFromCurrentTWRGroup,
  twrClearSessionRecords,
  finishCurrentTWRGroup,
  twrGetOneRecord,
  twrGetOneHeyjoeRecord,
  updateSession
} from '../../services'
import PersonCard from './PersonCard'

let loadHandler = null

class TwrList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      candidates: [],
      twrStudio: {},
      twrRoom: {},
      confirmClearSession: false
    }
  }

  componentDidMount () {
    this.loadStudio()
  }

  componentWillUnmount () {
    clearInterval (loadHandler)
  }

  loadStudio = async () => {
    const { twr} = this.props
    const parsed = twr.match(/(\w+)\/(\w+)/)
    const twrDomain = parsed[1]
    const twrStudioUri = parsed[2]
    const room = await twrGetTWRByDomain(twrDomain)
    const studio = await twrGetStudioByTWRUri(room._id, twrStudioUri)
    this.setState({
      twrStudio: studio,
      twrRoom: room
    })
    loadHandler = setInterval(this.loadCandidates, 5000)
  }

  loadCandidates = async () => {
    const { twrStudio: studio } = this.state
    const { session } = this.props
    const { twr_sync } = session
    let candidates = await twrFetchCheckInList(studio._id)
    const twrCids = candidates.map(c => c._id)
    const currentGroup = await getcurrentTWRGroup(session._id) || {}
    const heyjoeCandidates = twr_sync ? 
      await Promise.all(candidates.map(async c => {
        return await twrGetOneHeyjoeRecord(c._id, session._id)
      }))
    : await twrGetHeyjoeSessionRecords(session._id)
    candidates = twr_sync ? candidates.map(c => {
      const hc = heyjoeCandidates.find(h => h.twr_id === c._id)
      return {
        ...c,
        ...hc,
        _id: c._id
      }
    }) : heyjoeCandidates.map(hc => {
      const c = candidates.find(c => c._id === hc.twr_id)
      return {
        ...c,
        ...hc,
        _id: c._id
      }
    })
    const deletedTwrCandidates = await Promise.all(heyjoeCandidates.filter(h => !twrCids.includes(h.twr_id))
      .map(async h => {
        const c = await twrGetOneRecord(h.twr_id)
        return { ...c, ...h, _id: h.twr_id, twr_deleted: true }
      }))
    candidates = candidates.concat(deletedTwrCandidates)
    const currentGroupRecords = (currentGroup.twr_records || []).map(r_id => {
      return candidates.find(c => c._id === r_id)
    }).filter(r => !!r)
    this.setState({
      candidates
    })
    this.props.setTwrGroupCandidates(currentGroupRecords)
    this.props.setTwrCandidates(candidates || [])
  }

  addToGroup = async (record_id) => {
    const { session } = this.props
    await addRecordToCurentTWRGroup(record_id, session._id)
    this.loadCandidates()
  }

  leaveFromGroup = async (record_id) => {
    const { session } = this.props
    await removeRecordFromCurrentTWRGroup(record_id, session._id)
    this.loadCandidates()
  }

  finishCurrentGroup = async () => {
    const { session } = this.props
    await finishCurrentTWRGroup(session._id)
    this.loadCandidates()
  }

  toggleClearConfirm = () => {
    this.setState({
      confirmClearSession: !this.state.confirmClearSession
    })
  }

  clearRecords = async () => {
    this.setState({ loading: true })
    const { session } = this.props
    await twrClearSessionRecords(session._id)
    await this.loadCandidates()
    this.setState({
      loading: false,
      confirmClearSession: false
    })
  }

  setTwrSync = async (sync) => {
    const { session } = this.props
    const formData = new FormData()
    formData.append('twr_sync', sync)
    await updateSession(session._id, formData)
    this.props.reloadSession()
  }

  render () {
    const { loading, candidates, twrRoom, twrStudio, confirmClearSession } = this.state
    const { testMode, session } = this.props
    return <div>
      {loading && <div>Loading...</div>}
      <div className="d-flex align-items-center mt-3 ml-3 mr-1">
        {twrRoom && <label className="h5 mr-2">{twrRoom.name}</label>}
        {twrStudio && <label className="h5">{twrStudio.name}</label>}
        <label className="ml-auto d-flex align-items-center">
          <span className="mr-2">Sync Records</span>
          <Switch
            checkedIcon={null} uncheckedIcon={null}
            onColor="#ee514f"
            height={20}
            checked={session.twr_sync}
            onChange={(state) => this.setTwrSync(state)}
          />
        </label>
      </div>
      <ul className="list-group">
        {candidates.map((person, idx) => {
          return (
            <PersonCard
              key={idx}
              isTwr={true}
              id={person._id}
              idx={idx}
              testMode={testMode}
              showCallIn={false}
              groups={[]}
              {...person}
              setSeen={() => {}}
              setSkipped={() => {}}
              removeRecord={() => {}}
              signOut={() => {}}
              addToGroup={this.addToGroup}
              leaveFromGroup={this.leaveFromGroup}
              updateRecord={() => {}}
              session_id={session._id}
            />
          )
        })}
      </ul>
      <Modal
        show={!!confirmClearSession}
        onHide = {this.toggleClearConfirm}
      >
        <Modal.Header closeButton>
          <h5 className="mb-0">
            Are you sure?
          </h5>
        </Modal.Header>
        <Modal.Body>
          <strong className="mr-2">NOTE:</strong>
          Please make sure to clear the TWR records first on the TWR side before clearing on HeyJoe side.
        </Modal.Body>
        <Modal.Footer>
          <button
            className="btn"
            onClick={this.toggleClearConfirm}
          >Cancel.</button>
          <button
            className="btn btn-danger"
            onClick={this.clearRecords}
          >Clear.</button>
        </Modal.Footer>
      </Modal>
    </div>
  }
}

export default TwrList
