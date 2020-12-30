import React, { useEffect, useState } from 'react'
import PersonCard from '../PostingPage/PersonCard'
import {
  getUser,
  fetchCheckInList
} from '../../services'
import Footer from '../../components/Footer'
import './sizecards.scss'

const interval = 5000 // query api every 30 seconds

const SizeCards = ({ session }) => {
  const [ candidates, setCandidates] = useState([])
  const [ filter, setFilter ] = useState('all')
  const [ feedbackUsers, setFeedbackUsers] = useState([])
  const [ userFilter, setuserFilter ] = useState(null)
  const [ user ] = useState(getUser())
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
      if (!userFilter) {
        setuserFilter(fbkUsers[0])
      }
    })
    setCandidates(cs)
  }

  const setSize = () => {
    const count = parseInt((window.innerWidth - 60) / 320)
    console.log('count: ', count)
    document.querySelector('.size-cards').style.width = `${320 * count + 60}px`
  }

  useEffect(() => {
    const handle = setInterval(() => {
      fetchData()
    }, interval)
    setSize()
    return () => {
      clearInterval(handle)
    }
  }, [])

  window.addEventListener('resize', setSize)

  const filteredCandidates = candidates.filter(c => {
    const userFeedback = (c.feedbacks || {})[userFilter]
    return filter === "all" || userFeedback === filter
  })

  return (
    <div>
      <div className="d-flex justify-content-center mt-3">
        <div className="mr-2">
          <select className="form-control">
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
      <div className="size-cards mt-2">
        {filteredCandidates.map(c => {
          return (
            <div key={c._id} className="person-card">
              <PersonCard
                {...c}
                topAvatar={true}
              />
            </div>
          )
        })}

        {filteredCandidates.length === 0 && (
          <div className="text-center w-100">
            No candidates
          </div>
        )}
      </div>
      <Footer force={true} />
    </div>
  )
}

export default SizeCards
