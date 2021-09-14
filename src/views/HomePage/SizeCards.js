import React, { useEffect, useState } from 'react'
import classnames from 'classnames'
import PersonCard from '../PostingPage/PersonCard'
import Switch from "react-switch"
import {
  static_root,
  updateSessionFeedbacks,
  fetchCheckInList,
  getCurrentGroup,
  getUser,
  twrFetchCheckInList,
  getcurrentTWRGroup,
  twrGetHeyjoeSessionRecords,
  twrGetOneHeyjoeRecord,
  twrGetTWRByDomain,
  twrGetOneRecord,
  twrGetStudioByTWRUri,
} from '../../services'
import Footer from '../../components/Footer'
import { POSTINGPAGE_PERMISSIONS } from '../../constants'
import RecordVideosModal from './RecordVideos'
import './sizecards.scss'
import { FaFilePdf, FaPrint } from 'react-icons/fa'

const interval = 5000 // query api every 30 seconds

const SizeCards = ({ studio, session, setGroupCandidates, isClient = true, propsCandidates, isTwr, reloadSession }) => {
  const [user, setUser] = useState(null)
  const [ candidates, setCandidates] = useState([])
  const [ filter, setFilter ] = useState('all')
  const [ feedbackUsers, setFeedbackUsers] = useState([])
  const [ userFilter, setuserFilter ] = useState('all')
  const [ pickPrivate, setPickPrivate ] = useState(false)
  const [ yesPickShow, setYesPickShow ] = useState(false)
  const [ listTab, setListTab ] = useState('heyjoe')
  const [ twrStudio, setTwrStudio ] = useState(null)
  const [ roles, setRoles ] = useState([])
  const [ roleFilter, setRoleFilter ] = useState('all')
  const [ videoRecord, setVideoRecord ] = useState(null)

  const [ heyjoeCandidates, setHeyjoeCandidates ] = useState([])
  const [ twrCandidates, setTwrCandidates ] = useState([])
  const [ heyjoeGroupCandidates, setHeyjoeGroupCandidates ] = useState([])
  const [ twrGroupCandidates, setTwrGroupCandidates ] = useState([])

  const fetchTWRStudio = async () => {
    const { twr } = session
    const parsed = twr.match(/(\w+)\/(\w+)/)
    if (parsed) {
      const twrDomain = parsed[1]
      const twrStudioUri = parsed[2]
      const room = await twrGetTWRByDomain(twrDomain)
      const result = await twrGetStudioByTWRUri(room._id, twrStudioUri)
      setTwrStudio(result._id)
    }
  }

  const fetchTWRCandidates = async () => {
    console.log('twrStudio: ', twrStudio)
    if (!twrStudio) { return }
    const { twr_sync } = session
    let candidates = await twrFetchCheckInList(twrStudio)
    const twrCids = candidates.map(c => c._id)
    const currentGroup = await getcurrentTWRGroup(session._id) || {}
    if (twr_sync) {
      const tHCandidates = await Promise.all(candidates.map(async c => {
        return await twrGetOneHeyjoeRecord(c._id, session._id)
      }))
      const hCs = await twrGetHeyjoeSessionRecords(session._id)
      const hcIds = tHCandidates.map(h => h._id)
      const heyjoeCs = tHCandidates.concat(hCs.filter(hc => !hcIds.includes(hc._id)).map(c => ({ ...c, twr_deleted: true })))
      candidates = candidates.map(c => {
        const hc = heyjoeCs.find(h => h.twr_id === c._id)
        return {
          ...c,
          ...hc,
          _id: c._id
        }
      })
      const deletedTwrCandidates = await Promise.all(heyjoeCs.filter(h => !twrCids.includes(h.twr_id))
        .map(async h => {
          const c = await twrGetOneRecord(h.twr_id)
          return { ...c, ...h, _id: h.twr_id, twr_deleted: true }
        }))
      candidates = candidates.concat(deletedTwrCandidates)
    } else {
      const hCs = await twrGetHeyjoeSessionRecords(session._id)
      candidates = await Promise.all(hCs.map(async hc => {
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
    candidates = candidates.sort((c1, c2) => c1.twr_id.localeCompare(c2.twr_id))
      .map((c, idx) => ({ ...c, number: idx + 1}))
    const currentGroupRecords = (currentGroup.twr_records || []).map(r_id => {
      return candidates.find(c => c._id === r_id)
    }).filter(r => !!r)
    setTwrCandidates(candidates)
    setTwrGroupCandidates(currentGroupRecords)
  }

  useEffect(() => {
    if (session.twr) {
      fetchTWRStudio()
    }
  }, [session.twr])

  useEffect(() => {
    setGroupCandidates && setGroupCandidates(heyjoeGroupCandidates.concat(twrGroupCandidates))
  }, [heyjoeGroupCandidates, twrGroupCandidates])

  useEffect(() => {
    switch(listTab) {
      case 'heyjoe':
        setCandidates(heyjoeCandidates)
        break
      case 'twr':
        setCandidates(twrCandidates)
        reloadSession()
        break
    }
  }, [listTab, heyjoeCandidates, twrCandidates])

  const fetchData = async () => {
    const cs = await fetchCheckInList(session._id)
    const currentGroup = await getCurrentGroup(session._id) || {}
    setHeyjoeCandidates(cs.map((c, idx) => ({ ...c, number: idx + 1 })))
    setHeyjoeGroupCandidates((currentGroup.records || []).map(gc => {
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
    if (twrStudio && isClient) {
      const handle = setInterval(() => {
        fetchTWRCandidates()
      }, interval)
      return () => {
        clearInterval(handle)
      }
    }
  }, [twrStudio, isClient])

  useEffect(() => {
    const fbkUsers = []
    const rs = []
    candidates.map(c => {
      if (!rs.includes(c.role)) {
        rs.push(c.role)
      }
      return Object.keys(c.feedbacks || {})
    }).forEach(fs => {
      fs.forEach(f => {
        if (!fbkUsers.includes(f)) {
          fbkUsers.push(f)
        }
      })
    })
    setFeedbackUsers(fbkUsers)
    setRoles(rs.sort((a, b) => a.localeCompare(b)))
  }, [candidates])

  useEffect(() => {
    if (!isClient) {
      setCandidates(propsCandidates.map((c, idx) => ({
        ...c,
        number: idx + 1,
        twr_id: isTwr ? c._id : null
      })))
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
      if (session.size_card_pdf || session.schedule_pdf) {
        const headerUserMenu = document.querySelector('.header-user-menu')
        document.querySelector('.session-files-div').style.right = `calc(100vw - ${headerUserMenu.offsetLeft}px)`
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

  const showRecordVideosModal = (record) => {
    setVideoRecord(record)
  }

  const filteredCandidates = candidates.filter(c => {
    let userFeedback = ''
    if (userFilter === 'all') {
      userFeedback = Object.values(c.feedbacks || {})
    } else {
      userFeedback = [(c.feedbacks || {})[userFilter]]
    }
    return (filter === "all" || userFeedback.includes(filter))
      && (roleFilter === 'all' || c.role.trim() === roleFilter.trim())
  })
  const { twr_sync } = session

  return (
    <div>
      <div className="mt-3 pl-3 no-print d-flex align-items-end">
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
        <div className="d-flex align-items-end mr-auto">
          <div className="mr-2">
            <label>Roles</label>
            <select
              key={roleFilter}
              className="form-control"
              value={roleFilter}
              onChange={ev => {
                setRoleFilter(ev.target.value)
              }}
            >
              <option key="all" value="all">
                All
              </option>
              {roles.map(role => (
                <option key={role}>
                  {role || '--no role--'}
                </option>
              ))}
            </select>
          </div>
          <div className="mr-2">
            <label>Users</label>
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
          <div className="d-flex flex-column">
            <label>Feedbacks</label>
            <div>
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
          </div>
        </div>
        <div className="d-flex session-files-div">
          {typeof session.size_card_pdf === 'string' && (
            <a href={`${static_root}${session.size_card_pdf}`} target="_blank" className="btn btn-default text-white ml-2">
              <FaFilePdf className="mr-2" />
              Size Card PDF
            </a>
          )}
          {typeof session.schedule_pdf === 'string' && (
            <a href={`${static_root}${session.schedule_pdf}`} target="_blank" className="btn btn-default text-white">
              <FaFilePdf className="mr-2" />
              Schedule PDF
            </a>
          )}
        </div>
        {isClient &&
          <div className="ml-auto mr-2">
            <div className="d-flex align-items-center">
              {session.twr && <div className="tab-header d-flex">
                <label className={classnames("btn btn-sm flex-fill mb-0", { 'btn-danger': listTab === 'heyjoe' })} onClick={() => {
                  setListTab('heyjoe')
                }}>Hey Joe</label>
                <label className={classnames("btn btn-sm flex-fill mb-0", { 'btn-danger': listTab === 'twr' })} onClick={() => {
                  setListTab('twr')
                }}>TWR</label>
              </div>}
            </div>
            {listTab === 'twr' && <div className="text-right">
              <span>
                {twr_sync ? 'Syncing': 'Not Syncing'}
              </span>
            </div>}
          </div>
        }
      </div>
      <div className="size-cards mt-2">
        {filteredCandidates.map(c => {
          return (
            <div key={c._id} className="person-card avoid-break">
              <PersonCard
                key={c._id}
                {...c}
                topAvatar={true}
                studio={studio}
                showNumber={true}
                useSelfData={false}
                session_id={session._id}
                hideContact={!POSTINGPAGE_PERMISSIONS.CAN_VIEW_CONTACT()}
                showRecordVideosModal={showRecordVideosModal}
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
      <RecordVideosModal
        record={videoRecord} 
        closeModal={() => {
          setVideoRecord(null)
        }}
      />
      <Footer force={true} />
    </div>
  )
}

export default SizeCards
