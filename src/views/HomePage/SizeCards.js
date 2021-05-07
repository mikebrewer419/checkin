import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import PersonCard from '../PostingPage/PersonCard'
import Switch from "react-switch"
import {
  static_root,
  updateSessionFeedbacks,
  fetchCheckInList,
  getCurrentGroup,
  getUser
} from '../../services'
import Footer from '../../components/Footer'
import './sizecards.scss'
import { FaFilePdf, FaPrint } from 'react-icons/fa'

const interval = 5000 // query api every 30 seconds

const SizeCards = ({ studio, session, setGroupCandidates, isClient = true, propsCandidates, isTwr }) => {
  const [user, setUser] = useState(null)
  const [ candidates, setCandidates] = useState([])
  const [ filter, setFilter ] = useState('all')
  const [ feedbackUsers, setFeedbackUsers] = useState([])
  const [ userFilter, setuserFilter ] = useState('all')
  const [ pickPrivate, setPickPrivate ] = useState(false)
  const [ yesPickShow, setYesPickShow ] = useState(false)

  const fetchData = async () => {
    const cs = await fetchCheckInList(session._id)
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
    setUser(getUser())
    if (isClient) {
      const handle = setInterval(() => {
        fetchData()
      }, interval)
      return () => {
        clearInterval(handle)
      }
    }
  }, [])

  useEffect(() => {
    const fbkUsers = []
    candidates.map(c => Object.keys(c.feedbacks || {})).forEach(fs => {
      fs.forEach(f => {
        if (fbkUsers.includes(f)) {
          return
        }
        fbkUsers.push(f)
      })
    })
    setFeedbackUsers(fbkUsers)
  }, [candidates])

  useEffect(() => {
    if (!isClient) {
      setCandidates(propsCandidates.map((c, idx) => ({ ...c, number: idx + 1 })))
    }
  }, [propsCandidates])

  useEffect(() => {
    if (user && session) {
      const myPrivacy = (session.feedbackPrivates || {})[user.id]
      switch(myPrivacy) {
        case 'full-private':
          setPickPrivate(true)
          break
        case 'yes-private':
          setPickPrivate(true)
          setYesPickShow(true)
          break
      }
    }
  }, [session, user])

  useEffect(() => {
    let restrict = ''
    if (pickPrivate && yesPickShow) { restrict = 'yes-private' }
    if (pickPrivate && !yesPickShow) { restrict = 'full-private' }
    if (!pickPrivate && !yesPickShow) { restrict = null }
    console.log('restrict: ', restrict)
    updateSessionFeedbacks(session._id, restrict)
  }, [pickPrivate, yesPickShow])

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
      <div className={classnames("mt-3 pl-3 no-print", {
        'd-none': isTwr,
        'd-flex': !isTwr
      })}>
        <div className="mr-auto d-flex">
          <button
            className="btn btn-default"
            onClick={() => {
              window.print()
            }}
          >
            <FaPrint className="mr-2" />
            Print
          </button>
          <div className="d-flex flex-column align-items-center px-2">
            <span>Make picks private</span>
            <Switch
              checkedIcon={null} uncheckedIcon={null}
              height={20}
              onColor="#ee514f"
              checked={pickPrivate}
              onChange={(state) => {
                setPickPrivate(state)
                if (!state) {
                  setYesPickShow(false)
                }
              }}
            />
          </div>
          <div className="d-flex flex-column align-items-center px-2">
            <span>Show yes picks</span>
            <Switch
              checkedIcon={null} uncheckedIcon={null}
              height={20}
              checked={yesPickShow}
              onChange={(state) => setYesPickShow(state)}
              disabled={!pickPrivate}
            />
          </div>
        </div>
        <div className="d-flex">
          <div className="mr-2">
            <select
              key={userFilter}
              className="form-control"
              value={userFilter}
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
        </div>
        <div className="d-flex ml-auto">
          {typeof session.size_card_pdf === 'string' && (
            <a href={`${static_root}${session.size_card_pdf}`} target="_blank" className="btn btn-default ml-2">
              <FaFilePdf className="mr-2" />
              Size Card PDF
            </a>
          )}
          {typeof session.schedule_pdf === 'string' && (
            <a href={`${static_root}${session.schedule_pdf}`} target="_blank" className="btn btn-default">
              <FaFilePdf className="mr-2" />
              Schedule PDF
            </a>
          )}
        </div>
      </div>
      <div className="size-cards mt-2">
        {filteredCandidates.map(c => {
          return (
            <div key={c._id} className="person-card avoid-break">
              <PersonCard
                {...c}
                topAvatar={true}
                studio={studio}
                showNumber={true}
                useSelfData={false}
                isTwr={isTwr}
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
