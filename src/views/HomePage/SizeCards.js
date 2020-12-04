import React, { useEffect, useState } from 'react'
import PersonCard from '../PostingPage/PersonCard'
import {
  fetchCheckInList,
  static_root
} from '../../services'
import './sizecards.scss'

const interval = 5000 // query api every 30 seconds

const SizeCards = ({ session }) => {
  const [ candidates, setCandidates] = useState([])
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

  return (
    <div className="size-cards">
      {candidates.map(c => {
        return (
          <div key={c._id} className="card-item">
            <img
              src={c.avatar ? `${static_root}${c.avatar}` : require('../../assets/camera.png')}
              className="avatar"
            />
            <PersonCard
              key={c._id}
              {...c}
            />
          </div>
        )
      })}
    </div>
  )
}

export default SizeCards
