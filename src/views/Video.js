import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
  static_root,
  getStudioByUri,
  getOneRecord,
  getStudioVideosByDate
} from '../api'
import './Video.css'
import ReactPlayer from 'react-player'
import DatePicker from "react-datepicker"
import JSZip from 'jszip'
import JSZipUtils from 'jszip-utils'
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
      loading: false
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
    const { videos } = this.state
    const date_string = this.state.date.toISOString().split('T')[0]
    videos.forEach(video => {
      saveAs(video.url, video.uri)
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
    const { studio, videos, countPerRow, activeItem, activeRidx } = this.state
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
          {/* <a className="ml-2" onClick={() => this.downloadAllVideos()} >🠋</a> */}
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
                      style={{
                        width: itemWidth
                      }}
                    >
                      <div className="preview-wrapper">
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
                        <a className="mr-2" onClick={() => this.downloadOneVideo(item)} >🠋</a>
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
                      <a
                        href={`https://meet.heyjoe.io/${this.meeting_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {`https://meet.heyjoe.io/${this.meeting_id}`}
                      </a><br/>
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
  _id,
  first_name,
  last_name,
  email,
  phone,
  skipped,
  seen,
  signed_out,
  is_deleted,
  checked_in_time,
  call_in_time,
  signed_out_time,
  deleted_at
}) => {
  const checkInDateString = new Date(checked_in_time).toLocaleString("en-US", {timeZone: "America/Los_Angeles"})
  const callInDateString = new Date(call_in_time).toLocaleString("en-US", {timeZone: "America/Los_Angeles"})
  const signedOutDateString = new Date(signed_out_time).toLocaleString("en-US", {timeZone: "America/Los_Angeles"})
  const deleteAtDateString = new Date(deleted_at).toLocaleString("en-US", {timeZone: "America/Los_Angeles"})

  return (
    <div className="card">
      <div className="card-body px-0">
        <h5 className="card-title mb-2">
          <span className={seen?'text-success':'text-danger'} >
            ⬤
          </span>&nbsp;&nbsp;
          {first_name} {last_name}
          {skipped && <small>&nbsp;&nbsp;skipped</small>}
        </h5>
        <p className="card-text">Phone: {phone}</p>
        <p className="card-text">Email: {email}</p>
      </div>
    </div>
  )
}

export default VideoPage
