import React, { Component } from 'react'
import { Modal } from 'react-bootstrap'
import { FaDownload, FaArchive, FaTeethOpen, FaPenAlt, FaTrash, FaPrint } from 'react-icons/fa';
import {
  static_root,
  getStudioByUri,
  deletePageVideo,
  getOnePage,
  getPageVideos,
  updatePostingVideo,
  updatePostingManyVideo,
  createZipAndSendMail,
  uploadNewPostingVideo,
  updatePostingGroup,
  updatePostingGroupOrder,
  updatePostingVideoOrder,
  twrGetOneRecord,
  twrGetOneHeyjoeRecord,
} from '../../services'
import Footer from '../../components/Footer'
import './style.scss'
import ReactPlayer from 'react-player'
import PersonCard from './PersonCard'
import GroupSorter from './GroupSorter'
import { saveAs } from 'file-saver'
import { POSTINGPAGE_PERMISSIONS } from '../../constants'
import ReportPage from './report'

const itemWidth = 250
const thumbWidth = 150

const TABS = {
  VIDEOS: 'Videos',
  ARCHIVED: 'Archived'
}

class PostingPage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      studio: null,
      page: null,
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
      tab: TABS.VIDEOS,
      selectedGroup: {},
      twrCandidates: [],
      twrGroupRecords: [],
      twrStudio: ''
    }
  }
  
  setCount =() => {
    this.setState({
      countPerRow: parseInt((document.documentElement.clientWidth - 96) / (itemWidth + 32))
    })
  }

  fetchTWRCandidates = async (twr_ids) => {
    let candidates = await Promise.all(twr_ids.map(async tid => {
      return await twrGetOneRecord(tid)
    }))
    const heyjoeCandidates = await Promise.all(twr_ids.map(async tid => {
      return await twrGetOneHeyjoeRecord(tid)
    }))
    candidates = candidates.map((c, idx) => {
      const hc = heyjoeCandidates.find(h => h.twr_id === c._id)
      return {
        ...c,
        ...hc,
        number: idx + 1,
        _id: c._id,
        twr_id: c._id,
      }
    })
    return candidates
  }

  loadVideos = async (preventRepeat = false) => {
    this.setState({
      loading: true
    })
    const videos = await getPageVideos(this.page_id, this.state.tab === TABS.ARCHIVED)
    let groups = [], gidx = {}, idx = 0
    videos.forEach(video => {
      let groupName = video.group ? video.group.records.map(r => `${r.first_name} ${r.last_name}`).join(',') : ''
      if (!video.group) {
        video.group = {}
      }
      if (video.group.name && !video.group.name.includes('reserved field')) {
        groupName = video.group.name + ' : ' + groupName
      }
      if (isNaN(gidx[video.group._id])) {
        gidx[video.group._id] = idx
        groups[gidx[video.group._id]] = {
          _id: video.group._id,
          name: groupName || 'Unknown',
          order: video.group.order,
          idx,
          url: video.url,
          thumbnail: video.group.thumbnail || video.thumbnail,
          videos: []
        }
        idx ++
      }
      groups[gidx[video.group._id]].videos.push(video)
    })
    groups = groups.sort((g1, g2) => g1.order - g2.order)
    let needReorder = false
    let gids = []
    groups.forEach((g, idx) => {
      groups[idx].idx = idx
      gids.push(g._id)
      if (g.order !== idx + 1) {
        needReorder = true
      }
    })
    if (!preventRepeat && needReorder) {
      await updatePostingGroupOrder(gids)
      await this.loadVideos(true)
    } else {
      this.setState({
        videos,
        groups,
        loading: false
      })
    }
  }

  downloadAllVideos = () => {
    const { selectedForUploads, page } = this.state
    const email = window.prompt(
      `You are downloading ${selectedForUploads.length} videos.\nSpecify your email address to get download link`,
      window.localStorage.getItem('email')
    )
    if (!email) {
      return
    }
    createZipAndSendMail(selectedForUploads, page.name, email)
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
    let twrGroupRecords = []
    const { groups } = this.state
    if (groups[gidx]) {
      const group = groups[gidx].videos[0].group
      console.log('group: ', group)
      if (group.twr_records) {
        this.setState({ loading: true })
        twrGroupRecords = await this.fetchTWRCandidates(group.twr_records)
      }
    }
    if (gidx === this.state.activeGidx) {
      this.setState({
        activeRidx: -1,
        activeGidx: -1,
        activeItem: null,
        loading: false
      })
    }
    const group = this.state.groups[gidx].videos[0].group
    this.setState({
      activeRidx: ridx,
      activeGidx: gidx,
      activeItem: this.state.groups[gidx].videos[0],
      groupRecords: (group && group.records) || [],
      twrGroupRecords,
      loading: false
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
    await updatePostingVideo(video_id, { is_archived: archive })
    this.loadVideos()
  }

  handleGroupArchive = async (video_ids, archive) => {
    await updatePostingManyVideo(video_ids, { is_archived: archive })
    await this.loadVideos()
  }

  handleVideoDelete = async (video_id) => {
    const result = window.confirm(`Are you sure?`)
    if (result) {
      await deletePageVideo(video_id)
      this.loadVideos()
    }
  }

  uploadNewVideo = async (file) => {
    this.setState({ loading: true })
    const activeGroup = this.state.groups[this.state.activeGidx]
    await uploadNewPostingVideo(file, this.page_id, activeGroup._id)
    this.loadVideos()
  }

  updateGroupOrder = async (orderdGroup) => {
    this.setState({ loading: true })
    await updatePostingGroupOrder(orderdGroup.map(g => g._id))
    this.loadVideos()
  }

  updateVideoOrder = async (orderedVideo) => {
    this.setState({ loading: true })
    await updatePostingVideoOrder(orderedVideo.map(v => v._id))
    this.loadVideos()
  }

  async componentDidMount() {
    this.setCount()
    this.page_id = this.props.match.params.postingpage_id
    const studio_uri = this.props.match.params.uri
    const studio = await getStudioByUri(studio_uri)
    const page = await getOnePage(this.page_id)

    if (!studio) { return }
    document.title = `${studio.name} - ${page.name} Posting Page`;
    this.props.setLogo(studio.logo)
    this.setState({
      studio,
      page
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
          try {
            video.play()
          } catch (err) {
            console.log("Video play interrupted.")
          }
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
      page,
      groups,
      countPerRow,
      activeItem,
      activeRidx,
      activeGidx,
      selectedForUploads,
      twrGroupRecords,
      groupRecords,
      selectedGroup
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

    const combinedGroupRecords = groupRecords.concat(twrGroupRecords)

    return (
      <div>
        <div className="no-print video-app px-5 py-3">
          <div className={`loading ${this.state.loading?'show':''}`}>
            Processing...
          </div>
          <div className="video-header d-flex align-items-center justify-content-center">
            <h2 style={{textAlign: "center"}} className="mb-0">
              {studio.name}<br/>
              <small><small>{page.name}</small></small>
            </h2>
            <div className="d-flex align-items-center download-selected">
              <label
                className="mr-2 mb-0 btn btn-primary"
                onClick={() => window.print()}
              >
                <FaPrint className="mr-2 mt-n1"/>
                Print
              </label>
              {tab === TABS.VIDEOS && POSTINGPAGE_PERMISSIONS.CAN_SORT_GROUPS() && (
                <GroupSorter
                  groups={groups}
                  update={this.updateGroupOrder}
                />
              )}
              {selectedForUploads.length > 0 && (
                <label key="1" className="ml-2 mb-0 btn btn-primary" onClick={() => this.downloadAllVideos()} >
                  <FaDownload className="mr-2 mt-n1"/>
                  Download Selected
                </label>
              )}
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
            {POSTINGPAGE_PERMISSIONS.CAN_VIEW_ARCHIVE() &&
            <li className="nav-item">
              <a
                className={`nav-link h5 mb-0 ${tab === TABS.ARCHIVED ?'active':'text-danger'}`}
                href="#"
                onClick={() => this.changeTab(TABS.ARCHIVED)}
              >
                Archived
              </a>
            </li>}
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
                          {toArchive && (
                            <div className="order-indicator">
                              {group.order}
                            </div>
                          )}
                          <div
                            className="preview-wrapper"
                            onClick={() => {
                              this.handleGroupItemClick(ridx, group.idx)
                            }}
                          >
                            <img
                              className="dummy-player"
                              src={static_root+group.thumbnail}
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
                            {POSTINGPAGE_PERMISSIONS.CAN_UPDATE_GROUP() && group._id &&
                            <label
                              className="mb-0 ml-2"
                              onClick={ev => {
                                ev.stopPropagation()
                                ev.preventDefault()
                                this.setState({
                                  selectedGroup: group
                                })
                              }}
                            >
                              <FaPenAlt />
                            </label>}
                            {POSTINGPAGE_PERMISSIONS.CAN_ARCHIVE() &&
                            <label
                              className="mb-0 ml-auto"
                              onClick={() => {
                                this.handleGroupArchive(groupVideos, toArchive)
                              }}
                              title={toArchive ? 'Archive': 'Restore'}
                            >
                              {toArchive ? <FaArchive />: <FaTeethOpen />}
                            </label>}
                          </div>
                        </div>
                      )
                    })}
                  </div>,
                  ridx === activeRidx && activeGroup ?
                    <div className="d-flex flex-column active-group-row p-3" key="active-field">
                      {activeItem? (
                        <div className="row player-row mb-2">
                          <ReactPlayer
                            controls={true}
                            url={static_root+activeItem.uri}
                            key="video"
                            autoPlay
                            id="active-player"
                            className="col-auto"
                            height="100%"
                          />
                          <div key="info" className="info col-4">
                            {combinedGroupRecords.map(record => (
                              <div className="talent-summary" key={record._id}>
                                <PersonCard {...record} studio={studio} />
                              </div>
                            ))}
                            { combinedGroupRecords.length === 0 &&
                              <div className="talent-summary">
                                No talent information available
                              </div> }
                          </div>
                        </div>
                      ): null}
                      <div
                        key={activeGidx}
                        className="d-flex align-items-start group-videos-wrapper py-2"
                      >
                        {activeGroup.videos.map((video, idx) => {
                          return (
                            <div
                              key={video.uri+idx}
                              className={`mx-0 mb-2  mr-2 item ${activeItem.uri === video.uri? 'active': ''}`}
                            >
                              <div
                                style={{
                                  width: thumbWidth
                                }}
                              >
                                <div
                                  className="preview-wrapper"
                                  onClick={() => this.setState({ activeItem: video })}
                                >
                                  <img
                                    className="dummy-player dummy-video"
                                    src={static_root+video.thumbnail}
                                  />
                                </div>
                                <div className="d-flex">
                                  {POSTINGPAGE_PERMISSIONS.CAN_ARCHIVE() &&
                                  <label
                                    className="mb-0 ml-2"
                                    onClick={() => {
                                      this.handleArchiveVideo(video._id, !video.is_archived)
                                    }}
                                    title={video.is_archived ? 'Restore': 'Archive'}
                                  >
                                    {video.is_archived ? <FaTeethOpen />: <FaArchive />}
                                  </label>}
                                  {video.is_archived && (
                                    <label
                                      className="ml-auto mb-0"
                                      onClick={() => this.handleVideoDelete(video._id)}
                                      title="Delete"
                                    >
                                      <FaTrash />
                                    </label>
                                  )}
                                </div>
                              </div>
                            </div>
                          )
                        })}
                        {tab !== TABS.ARCHIVED && POSTINGPAGE_PERMISSIONS.CAN_ADD_VIDEO() && (
                          <div
                            style={{
                              width: thumbWidth,
                              alignSelf: 'stretch'
                            }}
                            className="pb-2"
                          >
                            <div className="video-uploader pt-4 px-3 mr-2 h-100">
                              <span>Click to upload New Video</span>
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
                        {POSTINGPAGE_PERMISSIONS.CAN_ADD_VIDEO() && (
                          <GroupSorter
                            title="Sort Videos"
                            groups={activeGroup.videos}
                            update={this.updateVideoOrder}
                            showThumbnail={true}
                          />
                        )}
                      </div>
                    </div>
                  : null
                ]
              )
            })}
          </div>
          <Footer/>
          <Modal
            show={!!selectedGroup._id}
            onHide = {() => {
              this.setState({
                selectedGroup: {}
              })
            }}
          >
            <Modal.Header closeButton>
              <h5 className="mb-0">
                Edit group
              </h5>
            </Modal.Header>
            <Modal.Body>
              <input
                type="text"
                className="form-control mb-2"
                placeholder="Group Name"
                value={selectedGroup.name}
                onChange={ev => {
                  this.setState({
                    selectedGroup: {
                      ...this.state.selectedGroup,
                      name: ev.target.value
                    }
                  })
                }}
              />
              <input
                type="file"
                className="form-control"
                onChange={ev => {
                  this.setState({
                    selectedGroup: {
                      ...this.state.selectedGroup,
                      thumbnail: ev.target.files[0]
                    }
                  })
                }}
              />
            </Modal.Body>
            <Modal.Footer>
              <button
                disabled={selectedGroup && !selectedGroup.name}
                className="btn btn-primary"
                onClick={async () => {
                  await updatePostingGroup(selectedGroup._id, selectedGroup)
                  this.setState({
                    selectedGroup: {}
                  })
                  await this.loadVideos()
                }}
              >
                Submit
              </button>
            </Modal.Footer>
          </Modal>
        </div>
        <ReportPage
          groups={groups}
          page={page}
          studio={studio}
        />
      </div>
    )
  }
}

export default PostingPage
