import React, { useState } from 'react'
import {
  Tabs,
  Tab,
} from 'react-bootstrap'

import UsersTab  from './Tabs/UsersTab'
import NoticeTab from './Tabs/NoticeTab'
import ServiceTab from './Tabs/ServiceTab'
import CalendarTab from './Tabs/CalendarTab'

import './style.scss'

const Admin = () => {
  const [tabKey, setTabKey] = useState('users')
  return (
    <div className="p-5 page-content">
      <Tabs
        activeKey={tabKey}
        onSelect={(key)=>{setTabKey(key)}}
      >
        <Tab
          eventKey = "users"
          title = "Users"
          className="py-3"
        >
          <UsersTab />
        </Tab>
        <Tab
          eventKey = "notices"
          title = "Notices"
          className="py-3"
        >
          <NoticeTab />
        </Tab>
        <Tab
          eventKey = "services"
          title = "Services"
          className="py-3"
        >
          <ServiceTab />
        </Tab>
        <Tab
          eventKey="calendar"
          title="Calendar"
          className="py-3"
        >
          <CalendarTab
            show={tabKey === 'calendar'}
          />
        </Tab>
      </Tabs>
    </div>
  )
}

export default Admin
