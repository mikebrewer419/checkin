import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  getAllStudios,
  deleteStudio,
  createOrUpdateStudio
} from './api'
import StudioForm from './form'
import './style.css'

const StudioList = () => {
  const [studios, setStudios] = useState([])
  const [selectedStudio, setSelectedStudio] = useState(null)

  const fetchAll = async () => {
    const studios = await getAllStudios()
    setStudios(studios)
  }

  const deleteStudioHandle = async (studio) => {
    const result = window.confirm("Want to delete?")
    if (result) {
      await deleteStudio(studio._id)
      await fetchAll()
    }
  }

  const handleStudioSubmit = async (event) => {
    event.preventDefault()
    const form_data = new FormData(event.target)
    var object = {}
    form_data.forEach(function(value, key){
      if (!value) return
      const parsed = /(.*)\[(\d+)\]/.exec(key)
      if (parsed) {
        const k = parsed[1]
        const idx = parseInt(parsed[2])
        if (object[k]) {
          object[k][idx] = value
        } else {
          object[k] = []
          object[k][idx] = value
        }
      } else {
        object[key] = value
      }
    })
    console.log("handleStudioSubmit -> object", object)
    await createOrUpdateStudio(object)
    await fetchAll()
    setSelectedStudio(null)
  }

  useEffect(() => {
    fetchAll()
  }, [])

  return (
    <div className="p-5 w-100 studios-list">
      <div className="d-flex justify-content-between mb-5">
        <h3>Heyjoe</h3>
        <button
          className="btn btn-primary"
          onClick={() => setSelectedStudio({})}
        >Create Studio</button>
      </div>
      <label>All Studios</label>
      <ul className="list-group">
        {studios.map(studio => (
          <li className="list-group-item d-flex" key={studio._id}>
            <h4>{studio.name}</h4>
            <div className="d-flex flex-column">
              {studio.jitsi_meeting_ids && studio.jitsi_meeting_ids.map(meeting_id => (
                <div key={meeting_id} className="d-flex mt-1 ml-2">
                  <Link to={`/studio/${studio.uri}/${meeting_id}`} className="mr-3" >
                    Checkin manage {meeting_id}
                  </Link>
                  <Link to={`/onboard/${studio.uri}/${meeting_id}`} className="mr-3" >
                    Onboard {meeting_id} 
                  </Link>
                  <Link to={`/video/${studio.uri}/${meeting_id}`} >
                    Video review {meeting_id}
                  </Link>
                </div>
              ))}
            </div>
            <div className="ml-auto">
              <label className="mr-2" onClick={() => setSelectedStudio(studio)}>✎</label>
              <label onClick={() => deleteStudioHandle(studio)}>🗑</label>
            </div>
          </li>
        ))}
      </ul>

      {selectedStudio &&
        <StudioForm
          {...selectedStudio}
          onSubmit={handleStudioSubmit}
          onCancel={() => setSelectedStudio(null)}
        />}
    </div>
  )
}

export default StudioList
