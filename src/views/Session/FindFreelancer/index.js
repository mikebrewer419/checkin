import React, {
  useEffect,
  useState,
} from 'react'

import {useParams} from 'react-router-dom'

import {
  Tabs,
  Tab,
} from 'react-bootstrap'

import {
  getOneSession,
} from '../../../services'

import Error403 from '../../Errors/403'
import Error404 from '../../Errors/404'
import Invite from './Invite'
import Invited from './Invited'

export default () => {
  const [session, setSession] = useState(undefined)
  const [permitted, setPermitted] = useState(true)
  const {session_id} = useParams()
  const [tabKey, setTabKey] = useState('invited')

  useEffect(()=>{
    getOneSession(session_id).then(res=>{
      setSession(res)
      let temp = false
      res.dates.forEach(it=>{
        temp  = temp || it.invite_session_manager || it.invite_lobby_manager
      })
      setPermitted(temp)
    }).catch(err=>{
      setSession(null)
    })
    
    
  }, [])
  
  if (session === null) {
    return <Error404 />
  }

  if (!permitted) {
    return <Error403 />
  }

  return (
    <div className="p-5">
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