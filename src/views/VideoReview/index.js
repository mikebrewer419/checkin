import React, { Component } from 'react'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import { Modal, Dropdown } from 'react-bootstrap'
import { FaArchive, FaTeethOpen, FaPenAlt, FaCopy, FaDownload, FaTrash, FaPlus } from 'react-icons/fa'
import {
  static_root,
  getStudioByUri,
  copyGroupFromSession,
  getPagesByStudio,
  getOneSession,
  getSessionVideos,
  createZipAndSendMail,
  getArchivedSessionVideos,
  deleteVideo,
  updateVideo,
  updateManyVideo,
  uploadNewVideo,
  updateGroup,
  getUser,
  createPage,
  fetchCheckInList,
  twrGetTWRByDomain,
  twrGetStudioByTWRUri,
  twrFetchCheckInList,
  twrGetHeyjoeSessionRecords,
  getNotification
} from '../../services'
import Footer from '../../components/Footer'
import './style.scss'
import ReactPlayer from 'react-player'
import { saveAs } from 'file-saver'
import { VIDEO_REVIEW_PERMISSIONS, POSTINGPAGE_PERMISSIONS, USER_TYPE } from '../../constants'
import PersonCard from '../PostingPage/PersonCard'
import SyncComponent from '../../components/sync'

const itemWidth = 250
const thumbWidth = 150

const TABS = {
  VIDEOS: 'Videos',
  ARCHIVED: 'Archived'
}
let noticeField = ''
let noticeUpdatedAtField = ''
let noticeTitle = ''

const user = getUser()

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
      twrCandidates: [],
      twrGroupRecords: [],
      twrStudio: '',
      archivedVideos: [],
      selectedPage: null,
      postingPages: [],
      tab: TABS.VIDEOS,
      selectedGroup: {},
      selectedTalentRecords: [],
      loadingTalentRecords: false,
      sessionTalentOptions: [],
      showNotification: '',
      notification: {}
    }
  }
  
  setCount =() => {
    this.setState({
      countPerRow: parseInt((document.documentElement.clientWidth - 96) / (itemWidth + 32))
    })
  }

  fetchTWRStudio = async () => {
    if (!this.state.session.twr) { return }
    const { twr } = this.state.session
    const parsed = twr.match(/(\w+)\/(\w+)/)
    if (parsed) {
      const twrDomain = parsed[1]
      const twrStudioUri = parsed[2]
      const room = await twrGetTWRByDomain(twrDomain)
      const result = await twrGetStudioByTWRUri(room._id, twrStudioUri)
      this.setState({ twrStudio: result._id }, () => { this.loadVideos() })
    }
  }

  fetchTWRCandidates = async () => {
    const { twrStudio, session } = this.state
    if (!twrStudio) { return [] }
    let candidates = await twrFetchCheckInList(twrStudio)
    const heyjoeCandidates = await twrGetHeyjoeSessionRecords(session._id)
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
      let groupName = video.group ? video.group.records.map(r => `${r.first_name} ${r.last_name}`).join(',') : ''
      if (!video.group) {
        video.group = {}
      }
      if (video.group.name && !video.group.name.includes('reserved field')) {
        groupName = video.group.name
      }
      if (isNaN(gidx[video.group._id])) {
        gidx[video.group._id] = idx
        groups[gidx[video.group._id]] = {
          _id: video.group._id,
          name: groupName || 'Unknown',
          idx,
          url: video.url,
          thumbnail: video.group.thumbnail || video.thumbnail,
          videos: []
        }
        idx ++
      }
      groups[gidx[video.group._id]].videos.push(video)
    })
    let twrCandidates = []
    if (this.state.session.twr) {
      twrCandidates = await this.fetchTWRCandidates()
    }
    this.setState({
      videos,
      groups,
      twrCandidates,
      loading: false
    })
  }

  loadPostingPages = async () => {
    const pages = await getPagesByStudio(this.state.studio._id)
    this.setState({
      postingPages: pages,
      selectedPage: (pages[0] || {})._id
    })
  }

  downloadAllVideos = () => {
    const { selectedForUploads, session, studio } = this.state
    const email = window.prompt(
      `You are downloading ${selectedForUploads.length} videos.\nSpecify your email address to get download link`,
      window.localStorage.getItem('email')
    )
    if (!email) {
      return
    }
    createZipAndSendMail(selectedForUploads, `${studio.name}-${session.name}`, email)
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
    if (this.state.session.twr) {
      if (groups[gidx]) {
        const group = groups[gidx].videos[0].group
        if (group) {
          twrGroupRecords = this.state.twrCandidates.filter(c => group.twr_records.includes(c.twr_id))
        }
      }
    }
    if (gidx === this.state.activeGidx) {
      this.setState({
        activeRidx: -1,
        activeGidx: -1,
        activeItem: null
      })
    }
    const group = this.state.groups[gidx].videos[0].group
    this.setState({
      activeRidx: ridx,
      activeGidx: gidx,
      activeItem: this.state.groups[gidx].videos[0],
      groupRecords: (group && group.records) || [],
      twrGroupRecords
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
    this.setState({ loading: true })
    const activeGroup = this.state.groups[this.state.activeGidx]
    await uploadNewVideo(file, this.session_id, activeGroup._id)
    this.loadVideos()
  }

  mounted = async () => {
    this.setCount()
    this.session_id = this.props.match.params.session_id
    const studio_uri = this.props.match.params.uri
    const studio = await getStudioByUri(studio_uri)
    const session = await getOneSession(this.session_id)

    if (!studio) { return }
    document.title = `${studio.name} Video Review`;
    this.props.setLogo(studio.logo)

    let n = await getNotification()
    n = n || {}
    if (USER_TYPE.CASTING_DIRECTOR()) {
      noticeField = 'casting_director_notice'
    }
    if (USER_TYPE.SESSION_MANAGER()) {
      noticeField = 'session_manager_notice'
    }
    noticeTitle = noticeField && noticeField.split('_').map(n => n[0].toUpperCase() + n.slice(1)).join(' ')
    noticeUpdatedAtField = `${noticeField}_updated_at`
    let showNotification = ''
    if (window.localStorage.getItem(noticeUpdatedAtField) !== n[noticeUpdatedAtField]) {
      showNotification = noticeField
    }

    this.setState({
      studio,
      session,
      showNotification,
      notification: n
    }, async () => {
      await this.loadVideos()
      await this.loadPostingPages()
      await this.fetchTWRStudio()
    })

    window.addEventListener('resize', this.setCount)
  }

  componentDidMount() {
    this.mounted()
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

  handleGroupsCopy = async () => {
    this.setState({ loading: true })
    const sendLink = document.querySelector('#send-audition-link').checked
    const { selectedPage } = this.state
    const selectedGroups = this.state.groups.filter((group, idx) => this.groupSelectedForDownload(idx))
    for (let i = 0; i < selectedGroups.length; i ++) {
      const group = selectedGroups[i]
      await copyGroupFromSession(group._id, selectedPage, sendLink)
    }
    this.setState({
      loading: false,
      showPageCopyModal: false,
      selectedForUploads: []
    })
  }

  setNewPostingPage = (pp) => {
    this.setState({
      newPostingPage: pp
    })
  }

  handlePostingPageSubmit = async (postingPage={}, studio_id) => {
    const { postingPages } = this.state
    const name = postingPage.name
    const names = postingPages.map(p => p.name)
    const originalPP = postingPages.find(p => p._id === postingPage._id)
    if (names.includes(name)
     && (!originalPP || originalPP && originalPP.name !== postingPage.name)
    ) {
      window.alert(`You already have the posting page ${name}`)
      return
    }
    await createPage({
      name,
      studio: studio_id
    })
    await this.loadPostingPages(studio_id)
    this.setNewPostingPage(null)
  }

  searchSessionTalents = async (name) => {
    this.setState({ loadingTalentRecords: true })
    const data = await fetchCheckInList(this.state.session._id)
    this.setState({
      loadingTalentRecords: false,
      sessionTalentOptions: data.filter(talent => {
        return talent.first_name.includes(name) || talent.last_name.includes(name) || `${talent.first_name} ${talent.last_name}`.includes(name)
      }).map(talent => ({
        ...talent,
        full_name: `${talent.first_name} ${talent.last_name}`
      }))
    })
  }

  allGroupsSelected = (checkTab) => {
    if (checkTab !== this.state.tab || this.state.videos.length === 0) {
      return false
    }
    return this.state.selectedForUploads.length === this.state.videos.length
  }

  toggleAllGroupSelect = (select) => {
    this.setState({
      selectedForUploads: select ? this.state.videos.map(v => v.uri) : []
    })
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
      twrGroupRecords,
      selectedForUploads,
      selectedGroup,
      selectedPage,
      showPageCopyModal,
      postingPages,
      newPostingPage,
      selectedTalentRecords,
      loadingTalentRecords,
      sessionTalentOptions,
      showNotification,
      notification
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
      <div className="video-app px-5 py-3">
        <div className={`loading ${this.state.loading?'show':''}`}>
          Processing...
        </div>
        <div className="video-header d-flex align-items-center justify-content-center">
          <div className="pp-menu">
            {postingPages.length > 0 && (
              <Dropdown>
                <Dropdown.Toggle variant="primary" id="dropdown-basic">
                  Posting Pages
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  {postingPages.map(pp => (
                    <Dropdown.Item
                      key={pp._id}
                      href={`/posting-page/${studio.uri}/${pp._id}`}
                      target="_blank"
                    >
                      { pp.name }
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
            )}
          </div>
          <h2 style={{textAlign: "center"}} className="mb-0">
            {studio.name}<br/>
            <small><small>{session.name} Video review</small></small>
          </h2>
          <div className="d-flex align-items-center download-selected">
            <SyncComponent studio={studio} session={session} />
            <label
              className="ml-2 mb-0 btn btn-primary"
              onClick={async () => {
                await this.loadPostingPages()
                this.setState({
                  newPostingPage: {}
                })
              }}
            >
              <FaPlus className="mr-2 mt-n1" />
              Add New Posting Page
            </label>
            {selectedForUploads.length > 0 && [
              <label
                key="0"
                className="ml-2 mb-0 btn btn-primary"
                onClick={async () => {
                  await this.loadPostingPages()
                  this.setState({
                    showPageCopyModal: true
                  })
                }}
              >
                <FaCopy className="mr-2 mt-n1"/>
                Copy to Posting page
              </label>,
              <label key="1" className="ml-2 mb-0 btn btn-primary" onClick={() => this.downloadAllVideos()} >
                <FaDownload className="mr-2 mt-n1"/>
                Download Selected
              </label>
            ]}
          </div>
        </div>
        <ul className="nav nav-tabs mt-2 border-bottom-0">
          <li className="nav-item">
            <a
              className={`nav-link h5 mb-0 ${tab === TABS.VIDEOS ?'active':'text-danger'}`}
              href="#"
              onClick={() => this.changeTab(TABS.VIDEOS)}
            >
              <input
                type="checkbox"
                className="mr-2"
                disabled={tab === TABS.ARCHIVED}
                checked={this.allGroupsSelected(TABS.VIDEOS)}
                onChange={(ev) => this.toggleAllGroupSelect(ev.target.checked)}
              />
              Videos
            </a>
          </li>
          {VIDEO_REVIEW_PERMISSIONS.CAN_VIEW_ARCHIVE() &&
          <li className="nav-item">
            <a
              className={`nav-link h5 mb-0 ${tab === TABS.ARCHIVED ?'active':'text-danger'}`}
              href="#"
              onClick={() => this.changeTab(TABS.ARCHIVED)}
            >
              <input
                type="checkbox"
                className="mr-2"
                disabled={tab === TABS.VIDEOS}
                checked={this.allGroupsSelected(TABS.ARCHIVED)}
                onChange={(ev) => this.toggleAllGroupSelect(ev.target.checked)}
              />
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
                          {VIDEO_REVIEW_PERMISSIONS.CAN_UPDATE_GROUP() && group._id &&
                          <label
                            className="mb-0 mx-2"
                            onClick={ev => {
                              ev.stopPropagation()
                              ev.preventDefault()
                              this.setState({
                                selectedGroup: group,
                                selectedTalentRecords: ((group.videos[0].group || {}).records || []).map(talent => ({
                                  ...talent,
                                  full_name: `${talent.first_name} ${talent.last_name}`
                                }))
                              })
                            }}
                          >
                            <FaPenAlt />
                          </label>}
                          {VIDEO_REVIEW_PERMISSIONS.CAN_ARCHIVE() &&
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
                          key={activeItem.uri}
                          autoPlay
                          id="active-player"
                          className="col-auto"
                          height="100%"
                        />
                        <div key="info" className="info col-4">
                          {combinedGroupRecords.map(record => (
                            <div className="talent-summary" key={record._id}>
                              <PersonCard
                                {...record}
                                hideContact={!POSTINGPAGE_PERMISSIONS.CAN_VIEW_CONTACT()}
                                reloadData={async () => {
                                  await this.loadVideos()
                                  const group = this.state.groups[activeGidx].videos[0].group
                                  this.setState({
                                    groupRecords: (group && group.records) || []
                                  })
                                }}
                              />
                            </div>
                          ))}
                          { combinedGroupRecords.length === 0 &&
                            <div className="talent-summary">
                              No talent information available
                            </div> }
                        </div>
                      </div>
                    ): null}
                    <div className="d-flex align-items-start group-videos-wrapper py-2">
                      {activeGroup.videos.map((video, index) => {
                        return (
                          <div
                            key={video.uri}
                            className={`mx-0 mb-2  mr-2 item ${activeItem.uri === video.uri? 'active': ''}`}
                          >
                            <div className="index-indicator">
                              { index + 1 }
                            </div>
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
                                {VIDEO_REVIEW_PERMISSIONS.CAN_ARCHIVE() &&
                                <label
                                  className="mb-0 ml-2"
                                  onClick={() => {
                                    this.handleArchiveVideo(video._id, !video.is_archived)
                                  }}
                                  title={video.is_archived ? 'Restore': 'Archive'}
                                >
                                  {video.is_archived ? <FaTeethOpen />: <FaArchive />}
                                </label>}
                                {video.is_archived && USER_TYPE.IS_SUPER_ADMIN() && (
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
                      {tab !== TABS.ARCHIVED && VIDEO_REVIEW_PERMISSIONS.CAN_ADD_VIDEO() && (
                        <div
                          style={{
                            width: thumbWidth,
                            minWidth: thumbWidth,
                            alignSelf: 'stretch'
                          }}
                          className="pb-4"
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
              className="form-control mb-2"
              onChange={ev => {
                this.setState({
                  selectedGroup: {
                    ...this.state.selectedGroup,
                    thumbnail: ev.target.files[0]
                  }
                })
              }}
            />
            <AsyncTypeahead
              id="talent-record-select"
              selected={selectedTalentRecords}
              onChange={value => {
                this.setState({
                  selectedTalentRecords: value
                })
              }}
              isLoading={loadingTalentRecords}
              labelKey="full_name"
              minLength={2}
              onSearch={this.searchSessionTalents}
              options={sessionTalentOptions}
              placeholder="Search for a talent user..."
              multiple
            />
          </Modal.Body>
          <Modal.Footer>
            <button
              disabled={selectedGroup && !selectedGroup.name}
              className="btn btn-primary"
              onClick={async () => {
                await updateGroup(selectedGroup._id, selectedGroup, selectedTalentRecords.map(r => r._id))
                this.setState({
                  selectedGroup: {}
                })
                await this.loadVideos()
                if (activeRidx !== -1) {
                  this.handleGroupItemClick(activeRidx, activeGidx)
                }
              }}
            >
              Submit
            </button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={showPageCopyModal}
          onHide={() => {
            this.setState({
              showPageCopyModal: false
            })
          }}
        >
          <Modal.Header closeButton>
            <h5 className="mb-0">
              Copy selected group
            </h5>
          </Modal.Header>
          <Modal.Body>
            <select
              className="form-control"
              value={selectedPage}
              onChange={ev => {
                this.setState({
                  selectedPage: ev.target.value
                })
              }}
            >
              {postingPages.map(page => (
                <option key={page._id} value={page._id}>
                  {page.name}
                </option>
              ))}
            </select>
            <label className="d-flex align-items-center mt-2">
              <input id="send-audition-link" type="checkbox" className="mr-2" />
              Send Audition link email?
            </label>
          </Modal.Body>
          <Modal.Footer>
            <button
              disabled={!selectedPage}
              className="btn btn-primary"
              onClick={this.handleGroupsCopy}
            >
              Submit
            </button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={!!newPostingPage}
          onHide={() => {
            this.setNewPostingPage(null)
          }}
        >
          <Modal.Header closeButton className="align-items-baseline">
            <h4 className="mb-0 mr-3">
              {newPostingPage && newPostingPage._id? `Update ${newPostingPage.name}`: 'Create New Posting Page'}
            </h4>
          </Modal.Header>
          <Modal.Body>
            {newPostingPage && (
              <input
                type="text"
                className="form-control mb-3"
                value={newPostingPage.name}
                onChange={ev => {
                  this.setNewPostingPage({
                    ...newPostingPage,
                    name: ev.target.value
                  })
                }}
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              disabled={newPostingPage && !newPostingPage.name}
              className="btn btn-primary"
              onClick={() => {
                this.handlePostingPageSubmit(newPostingPage, studio._id)
              }}
            >
              Submit
            </button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={!!showNotification}
          onHide = {() => {
            this.setState({
              showNotification: ''
            })
          }}
          className="notification-modal"
        >
          <Modal.Header closeButton>
            <h5 className="mb-0">
              {noticeTitle}
            </h5>
          </Modal.Header>
          <Modal.Body>
            <div className="notification-content" dangerouslySetInnerHTML={{__html: notification[noticeField]}} />
            <div className="mt-2">
              <button className="btn btn-primary" onClick={() => {
                window.localStorage.setItem(noticeUpdatedAtField, notification[noticeUpdatedAtField])
                this.setState({
                  showNotification: ''
                })
              }}>
                Ok, Got it.
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </div>
    )
  }
}

export default VideoPage
