import React, { Component } from 'react'
import {
  static_root,
  getStudioByUri,
  getOneRecord,
  getStudioVideosByDate
} from '../api'
import './Video.css'
import ReactPlayer from 'react-player'
import DatePicker from "react-datepicker"
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

    window.addEventListener('resize', this.setCount);
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

    return (
      <div className="video-app px-5">
        <div className={`loading ${this.state.loading?'show':''}`}>
          Processing...
        </div>
        <div className="video-header d-flex align-items-center">
          <div className="video-logo mr-2">
            <img src={static_root+studio.logo} alt={studio.name}/>
          </div>
          <h2 style={{textAlign: "center"}} className="mr-auto mb-0"> {studio.name} videos</h2>
          <DatePicker
            selected={this.state.date}
            onChange={this.handleDateChange}
          />
        </div>
        <div>
          {rows.length === 0 && <div>No videos available </div>}
          {rows.map((row, ridx) => {
            return (
              [
                <div className="row" key={ridx}>
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
                          light
                          controls={false}
                          url={item.url}
                          className="dummy-player"
                          width='100%'
                          height='100%'
                        />
                      </div>
                      <span>{item.ctime}</span> &nbsp;
                      <a
                        href={`https://meet.heyjoe.io/${this.meeting_id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {item.uri}
                      </a>
                    </div>
                  })}
                </div>,
                ridx === activeRidx && activeItem ?
                <div className="active-row" key="active-video">
                  {activeItem? [
                    <ReactPlayer controls={true} url={activeItem.url} key="video" autoPlay />,
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
        <h5 className="card-title mb-0">
          <span className={seen?'text-success':'text-danger'} >
            ⬤
          </span>&nbsp;&nbsp;
          {first_name} {last_name}
          {skipped && <small>&nbsp;&nbsp;skipped</small>}
        </h5>
        <p className="card-text">
          <small>{_id}</small>
        </p>
        <p className="card-text">Phone: {phone}</p>
        <p className="card-text">Email: {email}</p>
        <p className="card-text">Checked In: {checkInDateString}</p>
        <p className="card-text">Called in at: {callInDateString}</p>
        {signed_out &&
          <p className="card-text">Deleted at: {signedOutDateString}</p>}
        {is_deleted &&
          <p className="card-text">Deleted at: {deleteAtDateString}</p>}
      </div>
    </div>
  )
}

export default VideoPage
