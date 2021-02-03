import React, { useState, useEffect } from 'react'
import {
  getOneRecord,
  getOneSession
} from '../../services'

const RecordMessagePage = ({ match }) => {
  const [message, setMessage] = useState('')
  const [session, setSession] = useState('')

  useEffect(() => {
    const fetchData = async () => {
      const record_id = match.params.record_id
      const record = await getOneRecord(record_id)
      const ss = await getOneSession(record.session)
      setSession(ss)
      setMessage(record.lastMessage)
    }
    fetchData()
  }, [match.params.record_id])

  return (
    <div>
      {message}
    </div>
  )
}

export default RecordMessagePage
