import React from 'react'
import {
  twrFetchCheckInList,
  twrGetStudioByTWRUri,
  twrGetHeyjoeSessionRecords,
  twrGetTWRByDomain,
  getcurrentTWRGroup,
  addRecordToCurentTWRGroup,
  removeRecordFromCurrentTWRGroup,
  finishCurrentTWRGroup,
  twrGetOneRecord,
} from '../../services'
import PersonCard from './PersonCard'

let loadHandler = null

class TwrList extends React.Component {
  constructor (props) {
    super(props)
    this.state = {
      candidates: [],
      twrStudio: {},
      twrRoom: {}
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
    let candidates = await twrFetchCheckInList(studio._id)
    const twrCids = candidates.map(c => c._id)
    const currentGroup = await getcurrentTWRGroup(session._id) || {}
    const heyjoeCandidates = await twrGetHeyjoeSessionRecords(session._id)
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

  render () {
    const { loading, candidates, twrRoom, twrStudio } = this.state
    const { testMode, session } = this.props
    return <div>
      {loading && <div>Loading...</div>}
      <div className="text-center mt-3">
        {twrRoom && <label className="h5 mr-2">{twrRoom.name}</label>}
        {twrStudio && <label className="h5">{twrStudio.name}</label>}
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
    </div>
  }
}

export default TwrList
