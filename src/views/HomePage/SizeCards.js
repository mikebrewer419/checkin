import React, { useEffect, useState } from 'react'
import SizeCardItem from './SizeCardItem'
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
  const [ user ] = useState(getUser())
  const fetchData = async () => {
    const c = await fetchCheckInList(session._id)
    setCandidates(c)
  }

  const setSize = () => {
    const count = parseInt((window.innerWidth - 40) / 320)
    console.log('count: ', count)
    document.querySelector('.size-cards').style.width = `${320 * count + 40}px`
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
    const userFeedback = (c.feedbacks || {})[user.id]
    return filter === "all" || userFeedback === filter
  })

  return (
    <div>
      <div className="d-flex justify-content-center mt-3">
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
      <div className="size-cards">
        {filteredCandidates.map(c => {
          return (
            <SizeCardItem person={c} />
          )
        })}
      </div>
      <div className="text-center">
        {filteredCandidates.length === 0 && "No candidates."}
      </div>
      <Footer force={true} />
    </div>
  )
}

export default SizeCards
