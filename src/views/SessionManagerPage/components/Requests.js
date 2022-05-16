import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { listRequests } from '../../../services'
import { FaComment } from 'react-icons/fa'
import Pagination from '../../../components/Pagination'

const RequestTable = ({ user }) => {
  const [requests, setRequests] = useState([])
  const [page, setPage] = useState(0)
  const [pageCount, setPageCount] = useState(0)
  const [perPage, setPerPage] = useState(20)

  const loadData = async () => {
    const { count, requests } =  await listRequests({
      requested_person: user._id,
      skip: page * perPage,
      take: perPage
    })
    setRequests(requests)
    setPageCount(Math.ceil(count / perPage))
  }

  useEffect(() => {
    if (user && user._id) {
      loadData()
    }
  }, [user, page, perPage])

  return (
    <div>
      <label className='h5 mb-3'>Booking Requests</label>
      <table className='w-100 table table-striped'>
        <thead>
          <th>Date</th>
          <th>Project</th>
          <th>Response</th>
        </thead>
        <tbody>
          {requests.map(req => {
            return (
              <tr key={req._id}>
                <td>{ moment(new Date(req.date)).format('MM/DD/YY')}</td>
                <td>{ req.session.studio.name } { req.session.name }</td>
                <td>
                  <FaComment className='mr-2'/>
                  { req.response || 'Not responded' }
                </td>
              </tr>
            )
          })}
          {requests.length === 0 && (
            <tr>
              <td colSpan={3}>
                No requests yet
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {requests.length > 0 && (
        <Pagination
          page={page}
          setPage={setPage}
          pageCount={pageCount}
        />
      )}
    </div>
  )
}

export default RequestTable
