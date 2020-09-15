import React, { Component, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaArchive, FaTeethOpen } from 'react-icons/fa';
import {
  static_root,
  getStudioByUri,
  getGroupRecords,
  getOneSession,
  getSessionVideos,
  createZipAndSendMail,
  getArchivedSessionVideos,
  deleteVideo,
  updateVideo,
  updateManyVideo,
  uploadNewVideo
} from '../../services'
import Footer from '../../components/Footer'
import './style.scss'
import ReactPlayer from 'react-player'
import { saveAs } from 'file-saver'

const itemWidth = 250

const TABS = {
  VIDEOS: 'Videos',
  ARCHIVED: 'Archived'
}

class VideoPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      studio: null,
      session: null,
      countPerRow: 5,
      activeRidx: -1,
      activeGidx: -1,
      activeItem: null,
      videos: [],
      groups: [],
      records: {},
      loading: false,
      videoDates: [],
      selectedForUploads: [],
      groupRecords: [],
      archivedVideos: [],
      tab: TABS.VIDEOS
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
    let loadFunc = null
    if (this.state.tab === TABS.VIDEOS) loadFunc = getSessionVideos
    if (this.state.tab === TABS.ARCHIVED) loadFunc = getArchivedSessionVideos
    const videos = await loadFunc(this.session_id)
    let groups = [], gidx = {}, idx = 0
    videos.forEach(video => {
      const groupName = video.group ? video.group.records.map(r => `${r.first_name} ${r.last_name}`).join(',') : 'Unknown'
      if (isNaN(gidx[groupName])) {
        gidx[groupName] = idx
        groups[gidx[groupName]] = {
          name: groupName,
          idx,
          url: video.url,
          thumbnail: video.thumbnail,
          videos: []
        }
        idx ++
      }
      groups[gidx[groupName]].videos.push(video)
    })
    this.setState({
      videos,
      groups,
      loading: false
    })
  }

  downloadAllVideos = () => {
    const { selectedForUploads, session } = this.state
    const email = window.prompt(
      `You are downloading ${selectedForUploads.length} videos.\nSpecify your email address to get download link`,
      window.localStorage.getItem('email')
    )
    if (!email) {
      return
    }
    createZipAndSendMail(selectedForUploads, session.name, email)
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

  handleGroupItemClick = async (ridx, gidx) => {
    if (gidx === this.state.activeGidx) {
      this.setState({
        activeRidx: -1,
        activeGidx: -1,
        activeItem: null
      })
    }
    let grs = []
    try {
      const group = this.state.groups[gidx].videos[0].group
      if (group) {
        grs = await getGroupRecords(group._id)
      }
    } catch(e) { }
    this.setState({
      activeRidx: ridx,
      activeGidx: gidx,
      activeItem: this.state.groups[gidx].videos[0],
      groupRecords: grs
    })
  }

  groupSelectedForDownload = (gidx) => {
    const { selectedForUploads } = this.state
    return !this.state.groups[gidx].videos.filter(v => !selectedForUploads.includes(v.uri)).length
  }

  toggleGroupSelectedForDownload = (gidx, checked) => {
    const { selectedForUploads } = this.state
    const newUploads = Object.assign([], selectedForUploads)
    this.state.groups[gidx].videos.forEach(v => {
      const vIdx = newUploads.findIndex(s => s === v.uri)
      if(checked && !newUploads.includes(v.uri)) { newUploads.push(v.uri) }
      if(!checked && newUploads.includes(v.uri)) { newUploads.splice(vIdx, 1) }
    })
    this.setState({
      selectedForUploads: newUploads
    })
  }

  toggleVideoSelectedForDownload = (uri, checked) => {
    const { selectedForUploads } = this.state
    const newUploads = Object.assign([], selectedForUploads)
    const vIdx = selectedForUploads.findIndex(s => s === uri)
    if(checked && !newUploads.includes(uri)) { newUploads.push(uri) }
    if(!checked && newUploads.includes(uri)) { newUploads.splice(vIdx, 1) }
    this.setState({
      selectedForUploads: newUploads
    })
  }

  changeTab = (tab) => {
    if (this.state.tab === tab) { return }
    this.setState({
      tab,
      activeRidx: -1,
      activeGidx: -1
    }, this.loadVideos)
  }

  handleArchiveVideo = async (video_id, archive) => {
    await updateVideo(video_id, { is_archived: archive })
    this.loadVideos()
  }

  handleVideoDelete = async (video_id) => {
    const result = window.confirm(`Are you sure?`)
    if (result) {
      await deleteVideo(video_id)
      this.loadVideos()
    }
  }

  handleGroupArchive = async (video_ids, archive) => {
    await updateManyVideo(video_ids, { is_archived: archive })
    this.loadVideos()
  }

  uploadNewVideo = async (file) => {
    const activeGroup = this.state.groups[this.state.activeGidx]
    await uploadNewVideo(file, this.session_id, activeGroup.name)
    this.loadVideos()
  }

  async componentDidMount() {
    this.setCount()
    this.session_id = this.props.match.params.session_id
    const studio_uri = this.props.match.params.uri
    const studio = await getStudioByUri(studio_uri)
    const session = await getOneSession(this.session_id)

    if (!studio) { return }
    document.title = `${studio.name} Video Review`;
    this.props.setLogo(studio.logo)
    this.setState({
      studio,
      session
    }, async () => {
      await this.loadVideos()
    })

    window.addEventListener('resize', this.setCount)
  }

  componentDidUpdate() {
    if (this.state.activeItem && this.played !== this.state.activeItem.uri) {
      this.played = this.state.activeItem.uri
      setTimeout(() => {
        const video = document.querySelector('#active-player video')
        if (video) {
          video.play()
          video.addEventListener('ended', () => {
            const activeGroup = this.state.groups[this.state.activeGidx]
            const currentTabVideos = activeGroup.videos
              .filter(v => (!!v.is_archived === (TABS.ARCHIVED === this.state.tab)))
            const nextVideoIdx = currentTabVideos.findIndex(v => v.uri === this.state.activeItem.uri) + 1
            if (nextVideoIdx < currentTabVideos.length) {
              setTimeout(() => {
                this.setState({
                  activeItem: currentTabVideos[nextVideoIdx]
                })
              }, 1200)
            }
          })
        }
      }, 1000)
    }
  }

  render() {
    const {
      studio,
      tab,
      session,
      groups,
      countPerRow,
      activeItem,
      activeRidx,
      activeGidx,
      videoDates,
      groupRecords,
      selectedForUploads
    } = this.state

    let rows = []

    if (!studio) {
      return <div>Loading...</div>
    }

    for(let i = 0, l = groups.length; i < l; i += countPerRow) {
      rows.push(groups.slice(i, i + countPerRow))
    }

    const rowWidth = countPerRow * (itemWidth + 32)
    const activeGroup = groups[activeGidx]

    return (
      <div className="video-app px-5 py-3">
        <div className={`loading ${this.state.loading?'show':''}`}>
          Processing...
        </div>
        <div className="video-header d-flex align-items-center justify-content-center">
          <div className="video-logo mr-2 d-none">
            <Link to="/">
              <img src={static_root+studio.logo} alt={studio.name}/>
            </Link>
          </div>
          <h2 style={{textAlign: "center"}} className="mb-0">
            {studio.name}<br/>
            <small><small>{session.name} Video review</small></small>
          </h2>
          <div className="d-flex align-items-center download-selected">
            <select
              className="mr-2 d-none"
              value={this.state.date}
              onChange={(ev) => this.handleDateChange(new Date(ev.target.value))}
            >
              <option>---</option>
              {videoDates.map(date => <option key={date} value={date}>{date}</option>)}
            </select>
            {selectedForUploads.length > 0 &&
            <label className="ml-2 mb-0 btn btn-primary" onClick={() => this.downloadAllVideos()} >🠋 Download Selected</label>}
          </div>
        </div>
        <ul className="nav nav-tabs mt-2 border-bottom-0">
          <li className="nav-item">
            <a
              className={`nav-link h5 mb-0 ${tab === TABS.VIDEOS ?'active':'text-danger'}`}
              href="#"
              onClick={() => this.changeTab(TABS.VIDEOS)}
            >
              Videos
            </a>
          </li>
          <li className="nav-item">
            <a
              className={`nav-link h5 mb-0 ${tab === TABS.ARCHIVED ?'active':'text-danger'}`}
              href="#"
              onClick={() => this.changeTab(TABS.ARCHIVED)}
            >
              Achived
            </a>
          </li>
        </ul>
        <div className="video-wrapper">
          {rows.length === 0 && <div className="p-5">No videos available </div>}
          {rows.map((row, ridx) => {
            return (
              [
                <div className="video-row" key={ridx}  style={{width: `${rowWidth}px`}}>
                  {row.map(group => {
                    const groupVideos = group.videos.map(v => v._id)
                    const toArchive = !(tab === TABS.ARCHIVED)
                    return (
                      <div
                        key={group.idx}
                        className={`mx-3 item ${activeGidx === group.idx?'active':''}`}
                        style={{
                          width: itemWidth
                        }}
                      >
                        <div
                          className="preview-wrapper"
                          onClick={() => {
                            this.handleGroupItemClick(ridx, group.idx)
                          }}
                        >
                          <ReactPlayer
                            light={`${static_root}${group.thumbnail}`}
                            controls={false}
                            url={group.url}
                            className="dummy-player"
                            width='100%'
                            height='100%'
                          />
                        </div>
                        <div className="d-flex">
                          <input
                            type="checkbox"
                            checked={this.groupSelectedForDownload(group.idx)}
                            className="mr-2 mt-1"
                            onChange={(ev) => this.toggleGroupSelectedForDownload(group.idx, ev.target.checked) }
                          />
                          <div>{group.name}</div>

                          <label
                            className="mb-0 ml-auto"
                            onClick={() => {
                              this.handleGroupArchive(groupVideos, toArchive)
                            }}
                            title={toArchive ? 'Archive': 'Restore'}
                          >
                            {toArchive ? <FaArchive />: <FaTeethOpen />}
                          </label>
                        </div>
                      </div>
                    )
                  })}
                </div>,
                ridx === activeRidx && activeGroup ?
                  <div className="row active-group-row p-3" key="active-field">
                    {activeItem? [
                      <ReactPlayer
                        controls={true}
                        url={activeItem.url}
                        key="video"
                        autoPlay
                        id="active-player"
                        className="col-auto"
                      />,
                      <div key="info" className="info col-auto">
                        {groupRecords.map(record => (
                          <div className="talent-summary" key={record._id}>
                            <PersonCard {...record} />
                          </div>
                        ))}
                        { groupRecords.length === 0 &&
                          <div className="talent-summary">
                            No talent information available
                          </div> }
                      </div>
                    ]: null}
                    <div className="col d-flex flex-wrap align-items-start group-videos-wrapper py-2">
                      {activeGroup.videos.map(video => {
                        return (
                          <div
                            key={video.uri}
                            className={`mx-0 mb-2  mr-2 item ${activeItem.uri === video.uri? 'active': ''}`}
                          >
                            <div
                              style={{
                                width: itemWidth
                              }}
                            >
                              <div
                                className="preview-wrapper"
                                onClick={() => this.setState({ activeItem: video })}
                              >
                                <ReactPlayer
                                  light={`${static_root}${video.thumbnail}`}
                                  controls={false}
                                  url={video.url}
                                  className="dummy-player dummy-video"
                                  width="100%"
                                  height="100%"
                                />
                              </div>
                              <div className="d-flex">
                                <label
                                  className="mb-0 ml-2"
                                  onClick={() => {
                                    this.handleArchiveVideo(video._id, !video.is_archived)
                                  }}
                                  title={video.is_archived ? 'Restore': 'Archive'}
                                >
                                  {video.is_archived ? <FaTeethOpen />: <FaArchive />}
                                </label>
                                {video.is_archived && (
                                  <label
                                    className="ml-auto mb-0"
                                    onClick={() => this.handleVideoDelete(video._id)}
                                    title="Delete"
                                  >
                                    🗑
                                  </label>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                      {tab !== TABS.ARCHIVED && (
                        <div
                          style={{
                            width: itemWidth
                          }}
                        >
                          <div className="preview-wrapper pt-5">
                            <span>Upload New Video</span>
                            <input
                              key={activeGroup.videos.length}
                              type="file"
                              accept="video/*"
                              onChange={ev => {
                                this.uploadNewVideo(ev.target.files[0])
                              }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                : null
              ]
            )
          })}
        </div>
        <Footer/>
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
