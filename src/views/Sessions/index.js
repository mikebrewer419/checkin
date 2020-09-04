import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { listByManager } from  '../../services/session'
import './style.scss'

const SessionList = () => {
  const [ sessions, setSessions ] = useState([])
  const [page, setPage] = useState(0)
  const [pageSize, setPageSize] = useState(10)
  const [pageCount, setPageCount] = useState(1)

  const fetchManySessions = async () => {
    const {sessions, count} = await listByManager(page, pageSize)
    setSessions(sessions)
    setPageCount(Math.ceil(count / pageSize))
  }

  useEffect(() => {
    fetchManySessions()
  }, [page, pageCount])

  return (
    <div className="p-5 w-100">
      <div className="d-flex align-items-center justify-content-between mb-4">
        <label className="h1 mb-0">
          Sessions
        </label>
      </div>
      <div className="list-group mb-4">
        {sessions.map(session => (
          <div key={session._id} className="row mt-1 ml-2 mr-2 px-3 py-2">
            <div className="col-2">
              <h5 className="mb-0">{session.name}</h5>
              <label className="mb-0 small">{session.studio.name}</label>
            </div>
            <div className="col-auto">
              <Link to={`/studio/${session.studio.uri}/${session._id}`} className="text-danger"  target="_blank">
                Checkin
              </Link>
            </div>
            <div className="col-auto">
              <Link to={`/onboard/${session.studio.uri}/${session._id}`} className="text-danger"  target="_blank">
                Onboard
              </Link>
            </div>
            <div className="col-auto">
              <Link to={`/video/${session.studio.uri}/${session._id}`}  className="text-danger" target="_blank">
                Video Review
              </Link>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <div className="p-4">
            No sessions available for you.
          </div>
        )}
      </div>
      <div className="d-flex align-items-center justify-content-center">
        <ul className="mb-0 d-flex pagination">
          <li onClick={() => setPage(Math.max(page - 1, 0))}>
            {'<'}
          </li>
          <li className="mx-2">
            Page {page + 1} / {pageCount}
          </li>
          <li onClick={() => setPage(Math.min(page + 1, pageCount - 1))}>
            {'>'}
          </li>
        </ul>
      </div>
    </div>
  )
}

export default SessionList

