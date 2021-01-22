import React, { useEffect, useState } from 'react'
import PersonCard from '../PostingPage/PersonCard'
import {
  static_root,
  getUser,
  fetchCheckInList,
  getCurrentGroup
} from '../../services'
import Footer from '../../components/Footer'
import './sizecards.scss'

const interval = 5000 // query api every 30 seconds

const SizeCards = ({ studio, session, setGroupCandidates }) => {
  const [ candidates, setCandidates] = useState([])
  const [ filter, setFilter ] = useState('all')
  const [ feedbackUsers, setFeedbackUsers] = useState([])
  const [ userFilter, setuserFilter ] = useState('all')

  const fetchData = async () => {
    const cs = await fetchCheckInList(session._id)
    const fbkUsers = []
    cs.map(c => Object.keys(c.feedbacks || {})).forEach(fs => {
      fs.forEach(f => {
        if (fbkUsers.includes(f)) {
          return
        }
        fbkUsers.push(f)
      })
      setFeedbackUsers(fbkUsers)
    })
    const currentGroup = await getCurrentGroup(session._id) || {}
    setCandidates(cs.map((c, idx) => ({ ...c, number: idx + 1 })))
    setGroupCandidates((currentGroup.records || []).map(gc => {
      const cidx = cs.findIndex(c => c._id === gc._id)
      return {
        ...gc,
        number: cidx + 1
      }
    }))
  }

  useEffect(() => {
    const handle = setInterval(() => {
      fetchData()
    }, interval)
    return () => {
      clearInterval(handle)
    }
  }, [])

  const filteredCandidates = candidates.filter(c => {
    let userFeedback = ''
    if (userFilter === 'all') {
      userFeedback = Object.values(c.feedbacks || {})
    } else {
      userFeedback = [(c.feedbacks || {})[userFilter]]
    }
    return filter === "all" || userFeedback.includes(filter)
  })

  return (
    <div>
      <div className="d-flex justify-content-center mt-3">
        <div className="mr-2">
          <select
            className="form-control"
            onChange={ev => {
              setuserFilter(ev.target.value)
            }}
          >
            <option key="all" value="all">
              All
            </option>
            {feedbackUsers.map(fu => (
              <option key={fu}>
                {fu}
              </option>
            ))}
          </select>
        </div>
        <button
          className={"btn " + (filter === 'all' ? 'btn-primary' : 'btn-default')}
          onClick={() => {
            setFilter('all')
          }}
        >
          All
        </button>
        <button
          className={"btn " + (filter === 'yes' ? 'btn-primary' : 'btn-default')}
          onClick={() => {
            setFilter('yes')
          }}
        >
          Yes
        </button>
        <button
          className={"btn " + (filter === 'no' ? 'btn-primary' : 'btn-default')}
          onClick={() => {
            setFilter('no')
          }}
        >
          No
        </button>
        <button
          className={"btn " + (filter === 'maybe' ? 'btn-primary' : 'btn-default')}
          onClick={() => {
            setFilter('maybe')
          }}
        >
          Maybe
        </button>
        <div className="files-wrapper">
          {typeof session.size_card_pdf === 'string' && (
            <a href={`${static_root}${session.size_card_pdf}`} target="_blank" className="btn btn-default ml-2">
              Size Card PDF
            </a>
          )}
          {typeof session.schedule_pdf === 'string' && (
            <a href={`${static_root}${session.schedule_pdf}`} target="_blank" className="btn btn-default">
              Schedule PDF
            </a>
          )}
        </div>
      </div>
      <div className="size-cards mt-2">
        {filteredCandidates.map(c => {
          return (
            <div key={c._id} className="person-card">
              <PersonCard
                {...c}
                topAvatar={true}
                studio={studio}
                showNumber={true}
                useSelfData={false}
              />
            </div>
          )
        })}

        {filteredCandidates.length === 0 && (
          <div className="text-center w-100">
            No candidates
          </div>
        )}

        <div className="gap-filler"></div>
      </div>
      <Footer force={true} />
    </div>
  )
}

export default SizeCards
