import React, { useState, useEffect, useCallback } from 'react'
import classnames from 'classnames'
import ReactPlayer from 'react-player'
import { FaSpinner } from 'react-icons/fa'
import { Modal } from 'react-bootstrap'
import {
  static_root,
  getManyByTalent
} from '../../services'
import './recordmodel.scss'

const RecordVideosModal = ({ record, closeModal }) => {
  const [ loading, setLoading ] = useState(true)
  const [ recordVideos, setRecordVideos ] = useState([])
  const [ showRecordVideos, setShowRecordVideos ] = useState(false)
  const [ selectedIndex, setSelectedIndex ] = useState(0)

  const showRecordVideosModal = async (recordId) => {
    const videos = await getManyByTalent(recordId)
    setRecordVideos(videos)
    setShowRecordVideos(true)
    setLoading(false)
  }

  useEffect(() => {
    if (record) {
      showRecordVideosModal(record._id)
    } else {
      setShowRecordVideos(false)
    }
  }, [ record ])

  useEffect(() => {
    if (loading) { return }
    setTimeout(() => {
      const video = document.querySelector('#active-player video')
      if (video) {
        video.play()
        video.addEventListener('ended', () => {
          if (selectedIndex < recordVideos.length - 1) {
            setSelectedIndex(selectedIndex + 1)
          }
        })
      }
    }, 1000)
  }, [selectedIndex, loading])

  if (!record) {
    return null
  }

  if (loading) {
    return <FaSpinner />
  }

  const selectedVideo = recordVideos[selectedIndex]

  return (
    <Modal
      size="xl"
      show={showRecordVideos}
      onHide={() => closeModal(false)}
    >
      <Modal.Header closeButton>
        <div className="d-flex w-100 align-items-center">
          <h5 className="mr-auto">
            {record.first_name} {record.last_name} Videos
          </h5>
        </div>
      </Modal.Header>
      <Modal.Body>
        <div className="row">
          <div className="col-12">
            {selectedVideo
              ? <ReactPlayer
                key={selectedIndex}
                controls={true}
                url={static_root+selectedVideo.uri}
                id="active-player"
                className="w-100 pb-3"
                height="100%"
              />
              : <div className="text-center py-4">No Video Available.</div>
            }
          </div>
          <div className="col-12">
            <div className='videos-select'>
              {recordVideos.map((video, index) => {
                return (
                  <div
                    key={index}
                    className={classnames("video-item", {
                      selected: index === selectedIndex
                    })}
                    onClick={() => setSelectedIndex(index)}
                  >
                    <img
                      className="dummy-player dummy-video"
                      src={static_root+video.thumbnail}
                    />
                    <div className="labels">
                      {video.postingpage && (
                        <label>Postingpage: {video.postingpage.name}</label>
                      )}
                      {video.is_archived && (
                        <label>Archived</label>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  )
}

export default RecordVideosModal
