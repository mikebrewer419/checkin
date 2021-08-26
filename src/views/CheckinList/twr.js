import React from 'react'
import { Modal } from 'react-bootstrap'
import Switch from "react-switch"
import Papa from 'papaparse'
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
import { formatHour, formatTime } from '../../utils'

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
    if (parsed) {
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
  }

  loadCandidates = async () => {
    const { twrStudio: studio } = this.state
    const { session } = this.props
    const { twr_sync } = session
    let candidates = await twrFetchCheckInList(studio._id)
    const twrCids = candidates.map(c => c._id)
    const currentGroup = await getcurrentTWRGroup(session._id) || {}
    let heyjoeCandidates = []
    if (twr_sync) {
      const tHCandidates = await Promise.all(candidates.map(async c => {
        return await twrGetOneHeyjoeRecord(c._id, session._id)
      }))
      const hCs = await twrGetHeyjoeSessionRecords(session._id)
      const hcIds = tHCandidates.map(h => h._id)
      heyjoeCandidates = tHCandidates.concat(hCs.filter(hc => !hcIds.includes(hc._id)).map(c => ({ ...c, twr_deleted: true })))
      candidates = candidates.map(c => {
        const hc = heyjoeCandidates.find(h => h.twr_id === c._id)
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
    } else {
      const hCs = await twrGetHeyjoeSessionRecords(session._id)
      heyjoeCandidates = hCs
      candidates = await Promise.all(heyjoeCandidates.map(async hc => {
        let c = candidates.find(c => c._id === hc.twr_id)
        let twr_deleted = false
        if (!c) {
          c = await twrGetOneRecord(hc.twr_id)
          twr_deleted = true
        }
        return {
          ...hc,
          ...c,
          _id: hc.twr_id,
          twr_deleted
        }
      }))
    }
    candidates.sort((c1, c2) => c1.twr_id.localeCompare(c2.twr_id))
    const currentGroupRecords = (currentGroup.twr_records || []).map(r_id => {
      return candidates.find(c => c._id === r_id)
    }).filter(r => !!r)
    this.setState({
      candidates
    })
    this.props.setTwrGroupCandidates(currentGroupRecords)
    this.props.setTwrCandidates(candidates || [])
  }

  downloadCSV = async () => {
    this.setState({ csvLoading: true })
    const { candidates, twrRoom, twrStudio } = this.state
    const cids = candidates.map(c => c._id)
    const row_headers = [
      'first_name',
      'last_name',
      'email',
      'phone',
      // 'skipped',
      // 'seen',
      // 'signed_out',
      'checked_in_time',
      'sagnumber',
      // 'jitsi_meeting_id',
      'call_in_time',
      'agent',
      // 'actual_call',
      'interview_no',
      'role',
      'signed_out_time',
      // 'last_record_time'
      // 'studio',
    ]
    let csvContent = candidates
      .map(candidate => (
        row_headers.map(key => {
          switch(key) {
            case 'studio':
              return twrRoom.name
            case 'session': 
              return twrStudio.name
            case 'call_in_time':
            case 'signed_out_time':
            case 'checked_in_time':
              const dateString = formatTime(candidate[key])
              return dateString
            case 'actual_call':
              return formatHour(candidate[key])
            default:
              return `${(candidate[key] || '')}`
          }
        })
      ))
    csvContent.unshift(row_headers)
    console.log('csvContent: ', csvContent);
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(Papa.unparse(csvContent))

    var link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${twrRoom.name} ${twrStudio.name}-${(new Date()).toISOString()}.csv`)
    document.body.appendChild(link)
    
    link.click()
    document.body.removeChild(link)
    this.setState({ csvLoading: false })
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
