import React, { Component, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AsyncTypeahead } from 'react-bootstrap-typeahead'
import classnames from 'classnames'
import { FaDownload, FaStickyNote, FaFilm, FaListOl, FaTimes, FaSpinner, FaFileDownload } from 'react-icons/fa'
import { Modal } from 'react-bootstrap'
import Papa from 'papaparse'
import moment from 'moment'
import {
  sendMessage,
  fetchCheckInList,
  updateRecordField,
  removeCheckinRecord,
  clearSessionRecords,
  getLastVideosTime,
  addRecordToCurentGroup,
  removeRecordFromCurrentGroup,
  getCurrentGroup,
  finishCurrentGroup,
  scheduleSendMessage,
  twr_host,
  getNotification
} from '../../services'
import AvatarModal from '../../components/avatar-modal'
import './style.scss'
import { formatHour, formatTime } from '../../utils'
import PersonCard from './PersonCard'
import { USER_TYPE, USER_TYPES } from '../../constants'
import TwrList from './twr'

const messages = [
  "It's now your turn to audition, please enter 'MEETING_ID' into the app and click 'create/join",
  "You are on deck! We'll text you shortly to join the casting.",
  "Please head to Southpaw Studios and wait on the patio. You are 2nd in line",
  "Be prepared, you are next in line to head to Southpaw Studios. We will contact you shortly",
]

const deletedMessageText = 'You arrived at the wrong time. Please come back at the correct call time and check in again.'

let noticeField = ''
let noticeUpdatedAtField = ''
let noticeTitle = ''

class List extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loading: false,
      message: {
        to: '',
        body: ''
      },
      submitting: false,
      error: false,
      selectedRecord: null,
      confirmClearSession: false,
      timeOptions: [],
      csvLoading: false,
      optInCsvLoading: false,
      listTab: 'heyjoe',
      showNotification: '',
      notification: {},
    }
    this.messages = this.props.messages || messages
    this.deletedMessageText = this.props.delete_message || deletedMessageText
    this.positionBackMessage = this.props.studio.position_back_message
  }

  componentDidMount() {
    this.mounted()

    document.body.addEventListener('soft-refresh', this.mounted)
  }

  componentWillUnmount() {
    document.body.removeEventListener('soft-refresh', this.mounted)
  }

  componentDidUpdate(prevProps) {
    if (this.state.loading) {
      document.querySelector('.loading').classList.add('show')
    } else {
      document.querySelector('.loading').classList.remove('show')
    }
    if (JSON.stringify(prevProps.candidates) !== JSON.stringify(this.props.candidates)) {
      const { candidates } = this.props
      this.setState({
        candidates,
        loading: false
      })
    }
    if (JSON.stringify(prevProps.groupCandidates) !== JSON.stringify(this.props.groupCandidates)) {
      this.setState({
        loading: false
      })
    }
  }

  mounted = async () => {
    let timeOptions = []
    let time = moment().startOf('day')
    const endDayTime = moment().endOf('day')
    while (true) {
      time = time.add(5, 'minutes')
      if (endDayTime.diff(time) < 0) {
        break
      }
      timeOptions.push({
        value: time.toDate(),
        text: time.format('hh:mm a')
      })
    }

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
      timeOptions,
      showNotification,
      notification: n,
      loading: false
    })
  }

  setTwrRef = (elem) => {
    this.twrRef = elem
  }

  setSkipped = (id) => {
    const vm = this
    const { studio } = this.props
    this.setState({
      loading: true
    })
    updateRecordField(id, {
      skipped: true
    }).then(data => {
      let idx = vm.props.candidates.findIndex(p => p._id === id) + 1
      for(let i = 1; i < 4 && vm.props.candidates[idx] && idx < vm.props.candidates.length; i ++, idx ++) {
        if (!vm.props.candidates[idx].skipped && !!this.messages[i]) {
          sendMessage({
            to: vm.props.candidates[idx].phone,
            body: this.messages[i]
          }, studio._id, vm.props.candidates[idx]._id)
        }
      }
    }).catch(err => {
      console.log("App -> setSkipped -> err", err)
    })
  }

  setUnSeen = (id) => {
    const vm = this
    const { studio } = this.props
    this.setState({
      loading: true
    })
    updateRecordField(id, {
      seen: false
    }).then(() => {
      if (this.positionBackMessage) {
        let idx = vm.props.candidates.findIndex(p => p._id === id)
        sendMessage({
          to: vm.props.candidates[idx].phone,
          body: this.positionBackMessage
        }, studio._id, id)
      }
    })
  }

  setSeen = (id, again = false) => {
    const vm = this
    const { studio } = this.props
    this.setState({
      loading: true
    })
    updateRecordField(id, {
      seen: true,
      call_in_time: new Date().toISOString()
    }).then(data => {
      let idx = vm.props.candidates.findIndex(p => p._id === id)
      if (again) {
        sendMessage({
          to: vm.props.candidates[idx].phone,
          body: this.messages[0]
        }, studio._id, id)
        return
      }
      for(let i = 0; i < 4 && vm.props.candidates[idx] && idx < vm.props.candidates.length; i ++, idx ++) {
        if (!vm.props.candidates[idx].seen
          && (!vm.props.candidates[idx].skipped || i === 0)
          && !!this.messages[i]
        ) {
          sendMessage({
            to: vm.props.candidates[idx].phone,
            body: this.messages[i]
          }, studio._id, vm.props.candidates[idx]._id)
          if (i === 0 && studio.good_bye_message) {
            scheduleSendMessage({
              to: vm.props.candidates[idx].phone,
              body: studio.good_bye_message,
            }, studio._id, vm.props.candidates[idx]._id, 10)
          }
        }
      }
    }).catch(err => {
      console.log("App -> updateSeen -> err", err)
    })
  }

  removeRecord = (id, Phone, removedIdx) => {
    const result = window.confirm("Want to delete?")
    if (!result) {
      return
    }
    const vm = this
    const { studio } = this.props
    this.setState({
      loading: true
    })
    removeCheckinRecord(id).then(data => {
      if (!data.seen) {
        sendMessage({
          to: Phone,
          body: this.deletedMessageText
        }, studio._id, id)
      }
      let idx = vm.props.candidates.findIndex(p => (!p.seen && !p.skipped)) || vm.props.candidates.length
      for(let i = 1;
          i < 4 && vm.props.candidates[idx] && idx < vm.props.candidates.length
          && removedIdx <= idx;
          i ++, idx ++) {
        if (!vm.props.candidates[idx].skipped && !!this.messages[i]) {
          sendMessage({
            to: vm.props.candidates[idx].phone,
            body: this.messages[i]
          }, studio._id, vm.props.candidates[idx]._id)
        }
      }
    }).catch(err => {
      console.log("App -> removeRecode -> err", err)
    })
  }

  messageFieldChange = (event) => {
    const name = event.target.getAttribute('name')
    this.setState({
      message: { ...this.state.message, [name]: event.target.value }
    })
  }

  onMessageSend = (event) => {
    event.preventDefault()
    this.setState({ submitting: true })
    const { studio } = this.props
    sendMessage(this.state.message, studio._id)
      .then(data => {
        if (data.success) {
          this.setState({
            error: false,
            submitting: false,
            message: {
              to: '',
              body: ''
            }
          })
        } else {
          this.setState({
            error: true,
            submitting: false
          })
        }
      })
  }

  toggleClearConfirm = () => {
    if (this.state.listTab === 'twr') {
      this.twrRef.toggleClearConfirm()
    } else {
      this.setState({
        confirmClearSession: !this.state.confirmClearSession
      })
    }
  }

  clearRecords = async () => {
    this.setState({ loading: true })
    const { session } = this.props
    await clearSessionRecords(session._id)
    this.toggleClearConfirm()
  }

  signOut = (id) => {
    this.setState({ loading: true })
    updateRecordField(id, {
      signed_out: true,
      signed_out_time: new Date().toISOString()
    })
  }

  addToGroup = async (_id) => {
    this.setState({ loading: true })
    await addRecordToCurentGroup(_id)
  }

  leaveFromGroup = async (_id) => {
    const { session } = this.props
    if (this.state.listTab === 'twr') {
      this.twrRef.leaveFromGroup(_id, session._id)
      return
    }
    this.setState({ loading: true })
    await removeRecordFromCurrentGroup(_id)
  }

  finishCurrentGroup = async () => {
    if (this.state.listTab === 'twr') {
      this.twrRef.finishCurrentGroup()
      return
    }
    const { session } = this.props
    this.setState({ loading: true })
    await finishCurrentGroup(session._id)
  }

  selectRecord = (record) => {
    this.setState({
      selectedRecord: { ...record }
    })
  }

  updateRecord = async () => {
    this.setState({
      loading: true
    })
    const { selectedRecord } = this.state
    await updateRecordField(selectedRecord._id, {
      actual_call: selectedRecord.actual_call,
      role: selectedRecord.role
    })
    this.setState({
      selectedRecord: null
    })
  }

  downloadOptinCSV = async () => {
    const { studio } = this.props
    this.setState({ optInCsvLoading: true })
    const row_headers = [
      'first_name',
      'last_name',
      'Consent',
      'email',
      'Phone',
      'Timestamp',
      'Country'
    ]
    let csvContent = this.props.candidates.filter(c => c.opt_in).map(c => (
      row_headers.map(key => {
        switch(key) {
          case 'first_name':
            return c.first_name
            break
          case 'last_name':
            return c.last_name
            break
          case 'Consent':
            return "['sms']"
            break
          case 'email':
            return c.email
            break
          case 'Phone':
            return c.phone
            break
          case 'Timestamp':
            return c.checked_in_time
            break
          case 'Country':
            return 'USA'
            break
        }
      })
    ))
    csvContent.unshift(row_headers)
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(Papa.unparse(csvContent))

    var link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${studio.name}-${(new Date()).toISOString()}-optins.csv`)
    document.body.appendChild(link)
    
    link.click()
    document.body.removeChild(link)

    this.setState({ optInCsvLoading: false })
  }

  downloadCSV = async () => {
    this.setState({ csvLoading: true })
    const { studio, session } = this.props
    const cids = this.props.candidates.map(c => c._id)
    const lastVideoTimes = await getLastVideosTime(cids)
    const row_headers = [
      'first_name',
      'last_name',
      'email',
      'phone',
      // 'skipped',
      // 'seen',
      // 'signed_out',
      'checked_in_time',
      // 'jitsi_meeting_id',
      'actual_call',
      'last_record_time',
      // 'signed_out_time',
      'agent',
      'interview_no',
      'role',
      'sagnumber',
      // 'call_in_time',
      // 'studio',
    ]
    let csvContent = this.props.candidates
      .map(candidate => (
        row_headers.map(key => {
          switch(key) {
            case 'studio':
              return studio.name.replace(/,/g, ' ')
            case 'session': 
              return session.name.replace(/,/g, ' ')
            case 'call_in_time':
            case 'signed_out_time':
            case 'checked_in_time':
              const dateString = formatTime(candidate[key])
              return dateString
            case 'actual_call':
              return formatHour(candidate[key])
            case 'last_record_time':
              const timeItem = lastVideoTimes.find(l => l.id === candidate._id)
              return timeItem.time ? formatTime(timeItem.time) : ''
            default:
              return `${(candidate[key] || '')}`
          }
        })
      ))
    csvContent.unshift(row_headers.map(h => {
      return h === 'last_record_time'
        ? 'signed_out_time'
        : h
    }))
    const encodedUri = 'data:text/csv;charset=utf-8,' + encodeURIComponent(Papa.unparse(csvContent))

    var link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${studio.name}-${(new Date()).toISOString()}.csv`)
    document.body.appendChild(link)
    
    link.click()
    document.body.removeChild(link)
    this.setState({ csvLoading: false })
  }

  render() {
    const { studio, session, testMode, reloadSession, roles,
      dates, selectedDate, setSelectedDate } = this.props
    const {
      timeOptions,
      selectedRecord,
      confirmClearSession,
      optInCsvLoading,
      csvLoading,
      listTab, 
      showNotification,
      notification,
    } = this.state
    let twrOnboardLink = (session.twr || '').split('/')
    twrOnboardLink.splice(1, 0, 'onboard')
    twrOnboardLink = twrOnboardLink.join('/')

    const dt = session.dates.find(st => moment(st.start_time).isSame(moment(), 'day'))
    const dayType = dt && dt.start_time_type || ''

    return (
      <div className={"list-view " + (testMode? 'test': '')}>
        <div className="d-flex flex-column">
          <div className="studio-header">
            <h4 className="my-3 text-center">
              <span className="d-inline-block ml-2">Video Chat</span>
              {dayType && (
                <div>{dayType}</div>
              )}
              {testMode ? (
                <div className="d-flex justify-content-center">
                  <span className="text-danger h5 mb-0 mt-2">Virtual Lobby</span>
                </div>
              ) : (
                <div className="d-flex justify-content-center position-relative action-row">
                  {listTab === 'twr' ? 
                    <a
                      title="Session Check-In"
                      href={`${twr_host}${twrOnboardLink}`}
                      target="_blank"
                      className="mx-3"
                    >
                      <FaListOl size="16" className="text-danger" />
                    </a>
                  : (
                    <Link
                      title="Session Check-In"
                      to={`/onboard/${studio.uri}/${session._id}`}
                      target="_blank"
                      className="mx-3"
                    >
                      <FaListOl size="16" className="text-danger" />
                    </Link>
                  )}
                  <Link
                    to="?test=true"
                    target="_blank"
                    title="Virtual Lobby"
                    className="mx-3"
                  >
                    <FaStickyNote size="16" className="text-danger" />
                  </Link>
                  <Link
                    title="Video Review"
                    to={`/video/${studio.uri}/${session._id}`} 
                    target="_blank"
                    className="mx-3"
                  >
                    <FaFilm size="16" className="text-danger" />
                  </Link>
                  <a
                    title="Download CSV"
                    className="mx-3"
                  >
                    {csvLoading ?
                      <FaSpinner
                        size="16"
                        className="text-danger cursor-pointer spinning"
                      />
                    :
                      <FaDownload
                        size="16"
                        className="text-danger cursor-pointer"
                        onClick={() => {
                          if (listTab === 'twr') {
                            this.twrRef.downloadCSV()
                          } else {
                            this.downloadCSV()
                          }
                        }}
                      />
                    }
                  </a>
                  {listTab !== 'twr' && USER_TYPE.IS_SUPER_ADMIN() && (
                    <a
                      title="Download Opt Ins CSV"
                      className="mx-3"
                    >
                      {optInCsvLoading ?
                        <FaSpinner
                          size="16"
                          className="text-danger cursor-pointer spinning"
                        />
                      :
                        <FaFileDownload
                          size="16"
                          className="text-danger cursor-pointer"
                          onClick={this.downloadOptinCSV}
                        />
                      }
                    </a>
                  )}
                  <a
                    title="Clear Records"
                    className="mx-3"
                  >
                    <FaTimes
                      size="16"
                      className="text-danger cursor-pointer"
                      onClick={this.toggleClearConfirm}
                    />
                  </a>
                </div>
              )}
            </h4>
            {dates.length > 1 && (
              <div className="d-flex px-2 mb-2 align-items-center">
                <label className="mb-0">Select Date</label>
                <div className="flex-fill ml-2">
                  <select value={selectedDate} onChange={ev => {
                    setSelectedDate(ev.target.value)
                  }} className="form-control form-control-sm">
                    <option value={""}>All Dates</option>
                    {dates.map(d => {
                      return (
                        <option key={d} value={d}> {d} </option>
                      )
                    })}
                  </select>
                </div>
              </div>
            )}
          </div>
          {session.twr && <div className="tab-header d-flex">
            <label className={classnames("btn btn-sm flex-fill mb-0", { 'btn-danger': listTab === 'heyjoe' })} onClick={() => {
              this.setState({ listTab: 'heyjoe' })
              this.props.setListTab('heyjoe')
            }}>Hey Joe</label>
            <label className={classnames("btn btn-sm flex-fill mb-0", { 'btn-danger': listTab === 'twr' })} onClick={() => {
              this.setState({ listTab: 'twr' })
              this.props.setListTab('twr')
            }}>TWR</label>
          </div>}
          <ul className={classnames("list-group", { 'd-none': listTab !== 'heyjoe'})}>
            {this.props.candidates && this.props.candidates.map((person, idx) => {
              const showCallIn = !this.props.candidates[idx].seen &&
                (idx === 0 ||
                (this.props.candidates[idx - 1] &&
                  (this.props.candidates[idx - 1].seen ||
                  this.props.candidates[idx - 1].skipped)))
              return (
                <PersonCard
                  key={idx}
                  id={person._id}
                  idx={idx}
                  testMode={testMode}
                  showCallIn={showCallIn}
                  {...person}
                  setSeen={this.setSeen}
                  setSkipped={this.setSkipped}
                  setUnSeen={this.setUnSeen}
                  removeRecord={this.removeRecord}
                  signOut={this.signOut}
                  addToGroup={this.addToGroup}
                  leaveFromGroup={this.leaveFromGroup}
                  updateRecord={this.selectRecord}
                  sendSms={() => {
                    this.setState({
                      message: {
                        to: person.phone
                      }
                    })
                    setTimeout(() => {
                      document.querySelector('#body').focus()
                    }, 200)
                  }}
                  session_id={session._id}
                />
              )
            })}
          </ul>
          {session.twr && <div className={classnames({ 'd-none': listTab !== 'twr'})}>
            <TwrList
              ref={this.setTwrRef}
              twr={session.twr}
              session={session}
              reloadSession={reloadSession}
              testMode={testMode}
              setTwrGroupCandidates={this.props.setTwrGroupCandidates}
              setTwrCandidates={this.props.setTwrCandidates}
            />
          </div>}
          <form
            onSubmit={this.onMessageSend}
            className={classnames({
              'error': this.state.error,
              'active': this.state.message.to,
              'sms-form': true
            })}
          >
            <div>
              <div className="d-flex justify-content-lg-between">
                <label htmlFor="to">To:</label>
                {this.state.message.to && (
                  <button className="btn ml-auto mr-2" onClick={(ev) => {
                    ev.preventDefault()
                    this.setState({ message: { to: '', body: '' } })
                  }}>
                    Cancel
                  </button>
                )}
                <button className="btn px-2 py-0" type="submit" disabled={this.state.submitting}>
                  Send message
                </button>
              </div>
              <input
                type="tel"
                name="to"
                id="to"
                value={this.state.message.to}
                onChange={this.messageFieldChange}
              />
            </div>
            <div>
              <label htmlFor="body">Body:</label>
              <textarea name="body" id="body"
                value={this.state.message.body}
                onChange={this.messageFieldChange}
              />
            </div>
          </form>
        </div>
        <Modal
          show={!!selectedRecord && selectedRecord.actual_call}
          onHide = {() => {
            this.setState({
              selectedRecord: null
            })
          }}
        >
          <Modal.Header closeButton>
            <h5 className="mb-0">
              Update Actuall Call Time
            </h5>
          </Modal.Header>
          <Modal.Body>
            {selectedRecord && (
              <div>
                <select
                  value={selectedRecord.actual_call}
                  onChange={ev => {
                    this.setState({
                      selectedRecord: {
                        ...selectedRecord,
                        actual_call: ev.target.value
                      }
                    })
                  }}
                  className="form-control"
                  name="actualCall"
                  id="actualCall"
                >
                  {timeOptions.map(time => (
                    <option
                      key={time.value}
                      value={time.value}
                    >{time.text}</option>
                  ))}
                </select>
              </div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn btn-danger"
              onClick={this.updateRecord}
            >Update.</button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={!!selectedRecord && typeof(selectedRecord.role) === 'string'}
          onHide = {() => {
            this.setState({
              selectedRecord: null
            })
          }}
        >
          <Modal.Header closeButton>
            <h5 className="mb-0">
              Update Role
            </h5>
          </Modal.Header>
          <Modal.Body>
            <RoleEditor
              selectedRecord={selectedRecord}
              roles={roles}
              setRole={text => {
                this.setState({
                  selectedRecord: {
                    ...selectedRecord,
                    role: text
                  }
                })
              }}
            />
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn btn-danger"
              onClick={this.updateRecord}
            >Update.</button>
          </Modal.Footer>
        </Modal>
        <Modal
          show={!!confirmClearSession}
          onHide = {this.toggleClearConfirm}
        >
          <Modal.Header closeButton>
            <h5 className="mb-0">
              Are you sure?
            </h5>
          </Modal.Header>
          <Modal.Body>
            You are about to delete all session records.
          </Modal.Body>
          <Modal.Footer>
            <button
              className="btn"
              onClick={this.toggleClearConfirm}
            >Cancel.</button>
            <button
              className="btn btn-danger"
              onClick={this.clearRecords}
            >Clear.</button>
          </Modal.Footer>
        </Modal>
        {selectedRecord &&
        <AvatarModal
          key={selectedRecord._id}
          show={selectedRecord.avatar}
          record={selectedRecord}
          onClose={() => {
            this.setState({
              selectedRecord: null
            })
          }}
        />}

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

export const RoleEditor = ({
  selectedRecord,
  roles,
  setRole
}) => {
  if (!selectedRecord) {
    return null
  }
  return (
    <div>
      <AsyncTypeahead
        id="role"
        isLoading={false}
        key="role-select"
        className="mb-3"
        defaultSelected={[selectedRecord.role]}
        onChange={value => {
          if (value[0]) {
            setRole(value[0])
          }
        }}
        onSearch={text => {
          setRole(text)
        }}
        minLength={1}
        options={roles}
        paginate={false}
        maxResults={5}
        placeholder=""
      />
    </div>
  )
}

export default List
