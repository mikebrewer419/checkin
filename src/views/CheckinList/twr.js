import React from 'react'
import {
  twrFetchCheckInList,
  twrGetStudioByTWRUri,
  twrGetTWRByDomain,
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
    const candidates = await twrFetchCheckInList(studio._id)
    this.setState({
      candidates
    })
  }

  render () {
    const { loading, candidates, twrRoom, twrStudio } = this.state
    const { testMode } = this.props
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
              testMode={testMode || true}
              showCallIn={false}
              groups={[]}
              {...person}
              setSeen={() => {}}
              setSkipped={() => {}}
              removeRecord={() => {}}
              signOut={() => {}}
              addToGroup={() => {}}
              leaveFromGroup={() => {}}
              updateRecord={() => {}}
            />
          )
        })}
      </ul>
    </div>
  }
}

export default TwrList
