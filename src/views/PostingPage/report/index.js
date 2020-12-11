import React from 'react'
import {
  static_root
} from '../../../services'
import './style.scss'

const ReportPage = ({
  groups
}) => {
  console.log('groups', groups)
  return (
    <div className="report-page print-flex">
      {groups.map((group, gidx) => {
        let records = []
        group.videos.forEach(video => {
          const rids = records.map(r => r._id)
          records = records.concat(video.group.records.filter(r => !rids.includes(r._id)))
        })
        return (
          <div
            key={group._id}
            className="group-item"
          >
            <h3 className="text-center">Report</h3>
            <div className="group-item-header mb-2">
              <h4>Group { group.order }</h4>
              <img
                className="group-thumbnail mx-4"
                src={group.thumbnail ? `${static_root}${group.thumbnail}` : require('../../../assets/camera.png')}
              />
              {group.name}
            </div>
            <table className="table-bordered table talent-wrapper">
              {records.map((talent, tidx) => {
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
                        src={talent.avatar ? `${static_root}${talent.avatar}` : require('../../../assets/camera.png')}
                      />
                    </td>
                    <td className="talent-name">
                      <label>
                        {talent.first_name} {talent.last_name}
                      </label>
                      <br/>
                      <label>
                        {talent.role}
                      </label>
                      <br/>
                      <label>
                        {talent.agent}
                      </label>
                    </td>
                    <td></td>
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
