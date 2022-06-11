import React, {
  useEffect,
  useState,
} from 'react'
import moment from 'moment'

import {useParams} from 'react-router-dom'

import {
  Tabs,
  Tab,
} from 'react-bootstrap'

import {
  getOneSession,
  getStudioByUri,
} from '../../../services'

import Error403 from '../../Errors/403'
import Error404 from '../../Errors/404'
import Invite from './Invite'
import Invited from './Invited'
import { FaArrowLeft } from 'react-icons/fa'

export default () => {
  const [session, setSession] = useState(null)
  const [studio, setStudio] = useState(null)
  const [permitted, setPermitted] = useState(true)
  const {session_id, studio_uri} = useParams()
  const [tabKey, setTabKey] = useState('invited')

  useEffect(()=>{
    const loadData = async () => {
      const std = await getStudioByUri(studio_uri)
      const ses = await getOneSession(session_id)
      let temp = false
      ses.dates.forEach(it=>{
        temp  = temp || it.invite_session_manager || it.invite_lobby_manager
      })
      setPermitted(temp)
      setSession(ses)
      setStudio(std)
    }
    loadData()
  }, [])
  
  if (!session || !studio) {
    return <Error404 />
  }

  if (!permitted) {
    return <Error403 />
  }

  return (
    <div className="p-5">
      <div className='mb-3'>
        <div className='h4'>{studio.name} {session.name} Freelancer Invite</div>
        <div className='d-flex'>
          <div className='d-flex flex-column mr-3'>
            <label>Casting Director</label>
            {studio.casting_directors.map(c => {
              return c.email
            })}
            {studio.casting_directors.length === 0 && '-'}
          </div>
          <div className='d-flex flex-column'>
            <label>Session Dates</label>
            {session.dates.map(date => {
              return (
                <div key={date.start_time}>
                  <span className='mr-2'>{moment(new Date(date.start_time)).format('MM/DD')}</span>
                  <span className='mr-2'>{date.book_status}</span>
                  <span className='mr-2'>{date.start_time_type}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
      <Tabs
        activeKey={tabKey}
        onSelect={(key)=>{setTabKey(key)}}
      >
        <Tab
          eventKey="invited"
          title="Invited"
          className="py-2"
        >
          {session && <Invited session={session} />}
        </Tab>
        <Tab
          eventKey="invite"
          title="Invite"
          className="py-2"
        >
          {session && <Invite session={session} />}
        </Tab>
      </Tabs>
    </div>
  )
}