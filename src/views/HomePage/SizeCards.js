import React, { useEffect, useState } from 'react'
import PersonCard from '../PostingPage/PersonCard'
import {
  fetchCheckInList,
  static_root
} from '../../services'
import './sizecards.scss'

const SizeCards = ({ session }) => {
  const [ candidates, setCandidates] = useState([])
  const fetchData = async () => {
    const c = await fetchCheckInList(session._id)
    setCandidates(c)
  }

  useEffect(() => {
    const handle = setInterval(() => {
      fetchData()
    })
    return () => {
      clearInterval(handle)
    }
  }, [])

  return (
    <div className="size-cards">
      {candidates.map(c => {
        return (
          <div key={c._id} className="card-item">
            <img
              src={c.avatar ? `${static_root}${c.avatar}` : require('../../assets/camera.png')}
              className="avatar"
            />
            <PersonCard {...c} />
          </div>
        )
      })}
    </div>
  )
}

export default SizeCards
