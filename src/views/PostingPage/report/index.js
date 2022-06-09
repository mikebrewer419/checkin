import React from 'react'
import {
  static_root,
  getUser
} from '../../../services'
import './style.scss'

const ReportPage = ({
  groups,
  page,
  studio
}) => {
  const user = getUser()
  return (
    <div className="report-page print-only">
      <div className="d-flex mb-3">
        <img
          className="user-logo mx-4"
          src={user.logo ? static_root+user.logo : require('../../../assets/camera.png')}
        />
        <div>
          <label>
            {studio.name}
          </label>
          <br />
          <label>
            {page.name}
          </label>
        </div>
      </div>
      {groups.map((group, gidx) => {
        let records = []
        group.videos.forEach(video => {
          const rids = records.map(r => r._id)
          records = records.concat(video.group.records.filter(r => !rids.includes(r._id)))
        })
        return (
          <div
            key={group._id}
            className={"group-item " + ((gidx + 1) % 6 === 0 ? 'page-break': '')}
          >
            <div className="group-item-header mb-2">
              <label>Group { group.order }</label>
            </div>
            <table className="table-bordered table talent-wrapper">
              {records.map((talent, tidx) => {
                const userFeedback = (talent.feedbacks || {})[user.id]
                return (
                  <tr
                    key={talent._id}
                    className="talent-item"
                  >
                    <td className="talent-no">
                      <label>
                        { gidx + tidx + 1 }
                      </label>
                    </td>
                    <td className="talent-avatar">
                      <img
                        className="avatar-img"
                        src={talent.avatar ? static_root+talent.avatar : require('../../../assets/camera.png')}
                      />
                    </td>
                    <td className="talent-name">
                      <label>
                        {talent.first_name} {talent.last_name}
                      </label>
                      <br/>
                      <label>
                        Role: {talent.role}
                      </label>
                    </td>
                    <td className="feedback">
                      {userFeedback}
                    </td>
                    <td className="comments">
                      {talent.comments.map(c => {
                        return (
                          <div>
                            <label className="mb-0">{c.by.email}</label>
                            <p className="mb-1 pl-2">
                              {c.content}
                            </p>
                          </div>
                        )
                      })}
                    </td>
                  </tr>
                )
              })}
            </table>
          </div>
        )
      })}
    </div>
  )
}

export default ReportPage
