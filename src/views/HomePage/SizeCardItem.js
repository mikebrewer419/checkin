import React from 'react'
import PersonCard from '../PostingPage/PersonCard'
import {
  static_root
} from '../../services'

const SizeCardItem = ({ person }) => {
  return (
    <div key={person._id} className="person-card">
      <img
        src={person.avatar ? `${static_root}${person.avatar}` : require('../../assets/camera.png')}
        className="avatar"
      />
      <PersonCard
        key={person._id}
        {...person}
      />
    </div>
  )
}

export default SizeCardItem
