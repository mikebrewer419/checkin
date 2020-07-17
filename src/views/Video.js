import React, { Component, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  static_root,
  getStudioByUri,
  getOneRecord,
  getStudioVideosByDate,
  createZipAndSendMail
} from '../api'
import './Video.css'
import ReactPlayer from 'react-player'
import DatePicker from "react-datepicker"
import { saveAs } from 'file-saver'
import "react-datepicker/dist/react-datepicker.css"

const itemWidth = 250

class VideoPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      studio: null,
      date: new Date(),
      countPerRow: 5,
      activeRidx: -1,
      activeItem: null,
      videos: [],
      records: {},
      loading: false,
      selectedForUploads: []
    }
  }
  
  setCount =() => {
    this.setState({
      countPerRow: parseInt((document.documentElement.clientWidth - 96) / (itemWidth + 32))
    })
  }

  loadVideos = async () => {
    this.setState({
      loading: true
    })
    const date_string = this.state.date.toISOString().split('T')[0]
    const videos = await getStudioVideosByDate(this.state.studio._id, this.meeting_id, date_string)
    await Promise.all(videos.map(async (video) => {
      if (video.record) {
        const record = await this.getOneRecord(video.record)
        video.record_item = record
      }
      return
    }))
    this.setState({
      videos,
      loading: false
    })
  }

  getOneRecord = async (record_id) => {
    if (this.state.records[record_id]) {
      return this.state.records[record_id]
    }
    const record = await getOneRecord(record_id)
    this.setState({
      records: {
        ...this.state.records,
        [record_id]: record
      }
    })
    return record
  }

  handleDateChange = date => {
    this.setState({
      date,
      activeItem: null,
      activeRidx: -1
    }, this.loadVideos)
  }

  downloadAllVideos = () => {
    const date_string = this.state.date.toISOString().split('T')[0]
    const { selectedForUploads } = this.state
    const email = window.prompt(
      `You are downloading ${selectedForUploads.length} videos.\nSpecify your email address to get download link`,
      window.localStorage.getItem('email')
    )
    if (!email) {
      return
    }
    createZipAndSendMail(selectedForUploads, date_string, email)
      .then(() => {
        alert(`You will get an email with the download link once the archive is completed`)
        this.setState({
          selectedForUploads: []
        })
      })
  }

  downloadOneVideo = (video) => {
    saveAs(video.url, video.uri)
  }

  async componentDidMount() {
    this.setCount()
    this.meeting_id = this.props.match.params.meeting_id
    const studio_uri = this.props.match.params.uri
    const studio = await getStudioByUri(studio_uri)
    console.log("VideoPage -> componentDidMount -> studio", studio)

    if (!studio) { return }
    this.setState({
      studio
    }, async () => {
      await this.loadVideos()
    })

    window.addEventListener('resize', this.setCount)
  }

  componentDidUpdate() {
    if (this.state.activeItem) {
      setTimeout(() => {
        const video = document.querySelector('#active-player video')
        if (video) {
          video.play()
        }
      }, 1000)
    }
  }

  render() {
    const { studio, videos, countPerRow, activeItem, activeRidx, selectedForUploads } = this.state
    let rows = []

    if (!studio) {
      return <div>Loading...</div>
    }

    for(let i = 0, l = videos.length; i < l; i += countPerRow) {
      rows.push(videos.slice(i, i + countPerRow))
    }

    let activeItemRecord = null
    if (activeItem && activeItem.record) {
      this.getOneRecord(activeItem.record)
      activeItemRecord = this.state.records[activeItem.record] || {}
    }

    const rowWidth = countPerRow * (itemWidth + 32)

    return (
      <div className="video-app px-5">
        <div className={`loading ${this.state.loading?'show':''}`}>
          Processing...
        </div>
        <div className="video-header d-flex align-items-center">
          <div className="video-logo mr-2">
            <Link to="/">
              <img src={static_root+studio.logo} alt={studio.name}/>
            </Link>
          </div>
          <h2 style={{textAlign: "center"}} className="mr-auto mb-0"> {studio.name} videos</h2>
          <DatePicker
            selected={this.state.date}
            onChange={this.handleDateChange}
          />
          {selectedForUploads.length > 0 &&
          <label className="ml-2" onClick={() => this.downloadAllVideos()} >🠋 Download Selected</label>}
        </div>
        <div>
          {rows.length === 0 && <div>No videos available </div>}
          {rows.map((row, ridx) => {
            return (
              [
                <div className="video-row" key={ridx} style={{width: `${rowWidth}px`}}>
                  {row.map(item => {
                    return <div
                      key={item._id}
                      className={`mx-3 item ${activeItem && (activeItem.uri === item.uri)?'active':''}`}
                      style={{
                        width: itemWidth
                      }}
                    >
                      <div
                        className="preview-wrapper"
                        onClick={() => {
                          if (!activeItem || activeItem.uri !== item.uri) {
                            this.setState({
                              activeItem: item,
                              activeRidx: ridx
                            })
                          } else {
                            this.setState({
                              activeItem: null,
                              activeRidx: -1
                            })
                          }
                        }}
                      >
                        <ReactPlayer
                          light={`${static_root}${item.thumbnail}`}
                          controls={false}
                          url={item.url}
                          className="dummy-player"
                          width='100%'
                          height='100%'
                        />
                      </div>
                      <div className="d-flex">
                        <input
                          type="checkbox"
                          checked={selectedForUploads.includes(item.uri)}
                          className="mr-2 mt-1"
                          onChange={() => {
                            const newUploads = Object.assign([], selectedForUploads)
                            selectedForUploads.includes(item.uri)
                              ? newUploads.splice(selectedForUploads.findIndex(u => u === item.uri), 1)
                              : newUploads.push(item.uri)
                            this.setState({
                              selectedForUploads: newUploads
                            })
                          }}
                        />
                        {item.record_item ? <div>
                          {item.record_item.first_name} {item.record_item.last_name}
                        </div> : <div>No talent info available</div>}
                      </div>
                    </div>
                  })}
                </div>,
                ridx === activeRidx && activeItem ?
                <div className="active-row" key="active-video">
                  {activeItem? [
                    <ReactPlayer
                      controls={true}
                      url={activeItem.url}
                      key="video"
                      autoPlay
                      id="active-player"
                    />,
                    <div key="info" className="info">
                      {activeItemRecord ?
                        <div className="talent-summary">
                          <PersonCard {...activeItemRecord} />
                        </div> :
                        <div className="talent-summary">
                          No talent information available
                        </div>
                      }
                    </div>
                  ]: null}
                </div>
                :null
              ]
            )
          })}
        </div>
      </div>
    )
  }
}


const PersonCard = ({
  first_name,
  last_name,
  email,
  phone,
  skipped,
  seen
}) => {
  const [showContact, setShowContact] = useState(false)
  return (
    <div className="card px-4 py-1">
      <div className="card-body px-0">
        <h5 className="card-title mb-2">
          {first_name} {last_name}
          {skipped && <small>&nbsp;&nbsp;skipped</small>}
        </h5>
        <label onClick={() => setShowContact(!showContact)}>Contact</label>
        {showContact &&
        <div className="">
          <p className="card-text mb-1">P: <small>{phone}</small></p>
          <p className="card-text mb-1">E: <small>{email}</small></p>
        </div>}
      </div>
    </div>
  )
}

export default VideoPage
