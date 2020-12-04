import React, { useEffect, useState } from 'react'
import SizeCardItem from './SizeCardItem'
import {
  fetchCheckInList
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
          <SizeCardItem person={c} />
        )
      })}
    </div>
  )
}

export default SizeCards
