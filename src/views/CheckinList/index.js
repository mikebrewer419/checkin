import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FaCircle, FaDownload, FaMinus, FaUserSlash, FaStickyNote,
  FaFilm, FaListOl, FaUserFriends, FaTimes, FaPencilAlt } from 'react-icons/fa'
import { Modal } from 'react-bootstrap'
import moment from 'moment'
import {
  static_root,
  sendMessage,
  fetchCheckInList,
  updateRecordField,
  removeCheckinRecord,
  clearSessionRecords,

  addRecordToCurentGroup,
  removeRecordFromCurrentGroup,
  getCurrentGroup,
  finishCurrentGroup,
} from '../../services'
import AvatarModal from '../../components/avatar-modal'
import './style.scss'

const messages = [
  "It's now your turn to audition, please enter 'MEETING_ID' into the app and click 'create/join",
  "You are on deck! We'll text you shortly to join the casting.",
  "Please head to Southpaw Studios and wait on the patio. You are 2nd in line",
  "Be prepared, you are next in line to head to Southpaw Studios. We will contact you shortly",
]

const deletedMessageText = 'You arrived at the wrong time. Please come back at the correct call time and check in again.'

const formatTime = (time) => {
  const date = moment(new Date(time).toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
  if (date.isValid())
    return date.format('M/D/YYYY H:mm: a')
  return ''
}

const formatHour = (time) => {
  const date = moment(new Date(time).toLocaleString("en-US", {timeZone: "America/Los_Angeles"}))
  if (date.isValid())
    return date.format('H:mm: a')
  return ''
}

class List extends Component {

  constructor(props) {
    super(props)
    this.state = {
      loggedin: false,
      loading: false,
      loginError: '',
      candidates: [],
      message: {
        to: '',
        body: ''
      },
      submitting: false,
      error: false,
      selectedRecord: null,
      confirmClearSession: false,
      timeOptions: []
    }
    this.interval = 5000 // query api every 30 seconds
    this.messages = this.props.messages || messages
    this.deletedMessageText = this.props.delete_message || deletedMessageText
  }

  componentDidMount() {
    this.fetchData()
    setInterval(() => {
      this.fetchData()
    }, this.interval)
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
    this.setState({
      timeOptions
    })
  }

  componentDidUpdate() {
    if (this.state.loading) {
      document.querySelector('.loading').classList.add('show')
    } else {
      document.querySelector('.loading').classList.remove('show')
    }
  }

  fetchData = async () => {
    const { session } = this.props
    const candidates = await fetchCheckInList(session._id)
    const currentGroup = await getCurrentGroup(session._id) || {}
    this.props.setGroupCandidates(currentGroup.records || [])
    this.props.setCandidates(candidates || [])
    this.setState({
      candidates,
      loading: false
    })
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
      let idx = vm.state.candidates.findIndex(p => p._id === id) + 1
      for(let i = 1; i < 4 && vm.state.candidates[idx] && idx < vm.state.candidates.length; i ++, idx ++) {
        if (!vm.state.candidates[idx].skipped && !!this.messages[i]) {
          sendMessage({
            to: vm.state.candidates[idx].phone,
            body: this.messages[i]
          }, studio._id, vm.state.candidates[idx]._id)
        }
      }
      console.log('skipped ', data)
      this.fetchData()
    }).catch(err => {
      console.log("App -> setSkipped -> err", err)
    })
  }

  setSeen = (id) => {
    const vm = this
    const { studio } = this.props
    this.setState({
      loading: true
    })
    updateRecordField(id, {
      seen: true,
      call_in_time: new Date().toISOString()
    }).then(data => {
      let idx = vm.state.candidates.findIndex(p => p._id === id)
      for(let i = 0; i < 4 && vm.state.candidates[idx] && idx < vm.state.candidates.length; i ++, idx ++) {
        if ((!vm.state.candidates[idx].skipped || i === 0) && !!this.messages[i]) {
          sendMessage({
            to: vm.state.candidates[idx].phone,
            body: this.messages[i]
          }, studio._id, vm.state.candidates[idx]._id)
        }
      }
      console.log('updated ', data)
      this.fetchData()
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
      this.fetchData().then(() => {
        console.log('removed ', data)
        if (!data.seen) {
          sendMessage({
            to: Phone,
            body: this.deletedMessageText
          }, studio._id, id)
        }
        let idx = vm.state.candidates.findIndex(p => (!p.seen && !p.skipped)) || vm.state.candidates.length
        for(let i = 1;
            i < 4 && vm.state.candidates[idx] && idx < vm.state.candidates.length
            && removedIdx <= idx;
            i ++, idx ++) {
          if (!vm.state.candidates[idx].skipped && !!this.messages[i]) {
            sendMessage({
              to: vm.state.candidates[idx].phone,
              body: this.messages[i]
            }, studio._id, vm.state.candidates[idx]._id)
          }
        }
      })
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
    this.setState({
      confirmClearSession: !this.state.confirmClearSession
    })
  }

  clearRecords = async () => {
    this.setState({ loading: true })
    const { session } = this.props
    await clearSessionRecords(session._id)
    await this.fetchData()
    this.toggleClearConfirm()
  }

  signOut = (id) => {
    this.setState({ loading: true })
    updateRecordField(id, {
      signed_out: true,
      signed_out_time: new Date().toISOString()
    }).then(() => {
      this.fetchData()
    })
  }

  addToGroup = async (_id) => {
    this.setState({ loading: true })
    await addRecordToCurentGroup(_id)
    await this.fetchData()
  }

  leaveFromGroup = async (_id) => {
    this.setState({ loading: true })
    await removeRecordFromCurrentGroup(_id)
    await this.fetchData()
  }

  finishCurrentGroup = async () => {
    const { session } = this.props
    this.setState({ loading: true })
    await finishCurrentGroup(session._id)
    await this.fetchData()
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
    await this.fetchData()
  }

  downloadCSV = () => {
    const { studio, session } = this.props
    const row_headers = [
      'first_name',
      'last_name',
      'email',
      'phone',
      // 'skipped',
      // 'seen',
      // 'signed_out',
      'checked_in_time',
      'sagnumber',
      // 'jitsi_meeting_id',
      'call_in_time',
      'agent',
      'actual_call',
      'interview_no',
      'role',
      'signed_out_time',
      // 'studio',
    ]
    let csvContent = "data:text/csv;charset=utf-8," +row_headers.join(',')+'\n'
      + this.state.candidates
        .map(candidate => (
          row_headers.map(key => {
            switch(key) {
              case 'studio':
                return studio.name;
              case 'session': 
                return session.name;
              case 'call_in_time':
              case 'signed_out_time':
              case 'checked_in_time':
                const dateString = formatTime(candidate[key])
                return dateString
              case 'actual_call':
                return formatHour(candidate[key])
              default:
                return candidate[key]
            }
          }).join(',')
        )).join('\n')

    const encodedUri = encodeURI(csvContent)
    var link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `${studio.name}-${(new Date()).toISOString()}.csv`)
    document.body.appendChild(link)
    
    link.click()
    document.body.removeChild(link)
  }

  render() {
    const { studio, session, testMode } = this.props
    const { timeOptions, selectedRecord, confirmClearSession } = this.state
    return (
      <div className={"list-view " + (testMode? 'test': '')}>
        <div className="d-flex flex-column">
          <div className="studio-header">
            <h4 className="my-3 text-center">
              <span>{studio.name}</span>
              &nbsp;
              <span>{session.name}</span>
              <span className="d-inline-block ml-2">Video Chat</span>
              {testMode ? (
                <div className="d-flex justify-content-center">
                  <span className="text-danger h5 mb-0 mt-2">Virtual Lobby</span>
                </div>
              ) : (
                <div className="d-flex justify-content-center">
                  <Link
                    title="Session Check-In"
                    to={`/onboard/${studio.uri}/${session._id}`}
                    target="_blank"
                    className="mx-3"
                  >
                    <FaListOl size="16" className="text-danger" />
                  </Link>
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
                    <FaDownload
                      size="16"
                      className="text-danger cursor-pointer"
                      onClick={this.downloadCSV}
                    />
                  </a>
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
          </div>
          <ul className="list-group">
            {this.state.candidates && this.state.candidates.map((person, idx) => {
              const showCallIn = !this.state.candidates[idx].seen &&
                (idx === 0 ||
                (this.state.candidates[idx - 1] &&
                  (this.state.candidates[idx - 1].seen ||
                  this.state.candidates[idx - 1].skipped)))
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
                  removeRecord={this.removeRecord}
                  signOut={this.signOut}
                  addToGroup={this.addToGroup}
                  leaveFromGroup={this.leaveFromGroup}
                  updateRecord={this.selectRecord}
                />
              )
            })}
          </ul>
          <form
            onSubmit={this.onMessageSend}
            className={this.state.error ? 'error sms-form' : 'sms-form'}
          >
            <div>
              <div className="d-flex justify-content-lg-between">
                <label htmlFor="to">To:</label>
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
            {selectedRecord && (
              <div>
                <input
                  type="text"
                  className="form-control"
                  value={selectedRecord.role}
                  onChange={ev => {
                    this.setState({
                      selectedRecord: {
                        ...selectedRecord,
                        role: ev.target.value
                      }
                    })
                  }}
                />
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
            this.fetchData()
          }}
        />}
      </div>
    )
  }
}

export default List

export const PersonCard = ({
  idx,
  _id,
  showCallIn,
  group,
  first_name,
  last_name,
  email,
  phone,
  skipped,
  seen,
  signed_out,
  checked_in_time,
  actual_call,
  setSeen,
  setSkipped,
  signOut,
  removeRecord,
  addToGroup,
  leaveFromGroup,
  hideDelete,
  showLeave,
  updateRecord,
  groups,
  avatar,
  role,
  agent,
  testMode
}) => {
  const dateString = formatTime(checked_in_time)

  return (
    <div className="video-chat-person-card card text-primary border-0">
      <div className="card-body pr-1">
        <div className="card-title d-flex align-items-center mb-0">
          <h5 className="mr-2 cursor-pointer d-flex align-items-center cursor-pointer" onClick={() => {
            if (addToGroup && !testMode) {
              addToGroup(_id)
            }
          }}>
            {!groups.length && <FaCircle className="text-danger mr-2" />}
            {first_name} {last_name}
          </h5>
          <small className="card-text mb-0">
            Checked In:
            <span className="ml-2">{dateString}</span>
          </small>
          <div className="d-flex align-items-center ml-auto">
            {skipped &&
              <small className="mr-1">skipped</small>}
            {signed_out &&
              <small className="float-right mr-1">Signed out</small>}
            {seen && !signed_out && signOut && !testMode && (
              <FaUserSlash
                className="text-danger ml-auto mr-1 cursor-pointer"
                title="Sign out this user"
                onClick={() => signOut(_id)}
              />
            )}
            {!hideDelete && !testMode && (
              <FaTimes title="Remove" className="text-danger mx-1 cursor-pointer" onClick={() => removeRecord(_id, phone, idx)} />
            )}
            {showLeave && leaveFromGroup && !testMode && (
              <FaMinus title="Leave Group" className="text-danger mx-1 cursor-pointer" onClick={() => leaveFromGroup(_id)} />
            )}
          </div>
        </div>
        <p className="card-text d-none">
          <small>{_id}</small>
        </p>
        <div className="d-flex">
          <div>
            <p className="card-text mb-0">
              <span>Phone:</span>
              <strong className="ml-2">{phone}</strong>
            </p>
            <p className="card-text mb-0">
              <span>Email:</span>
              <strong className="ml-2">{email}</strong>
            </p>
            <p className="card-text mb-0 actual-call-section">
              <span>Actual Call:</span>
              <strong className="mx-2">{formatHour(actual_call)}</strong>
              {!testMode && (
                <FaPencilAlt small className="text-danger edit-trigger cursor-pointer" onClick={() => updateRecord({ _id, actual_call })} />
              )}
            </p>
            <p className="card-text mb-0">
              <span>Role:</span>
              <strong className="ml-2">{role}</strong>
              {!testMode && (
                <FaPencilAlt small className="text-danger edit-trigger cursor-pointer" onClick={() => updateRecord({ _id, role })} />
              )}
            </p>
            <p className="card-text mb-0">
              <span>Agent:</span>
              <strong className="ml-2">{agent}</strong>
            </p>
          </div>
          <p className="ml-auto mr-2 mb-0">
            <img
              src={avatar ? static_root+avatar : require('../../assets/camera.png')}
              className="small-avatar"
              onClick={() => updateRecord({
                _id,
                avatar: avatar || 'empty'
              })}
            />
          </p>
        </div>
        <div className="d-flex mt-1">
          {(!!showCallIn || (!seen && skipped)) && setSeen && !testMode &&
          <button className="btn px-2 py-0 btn-outline-dark" onClick={() => setSeen(_id)}>
            Call In SMS
          </button>}
          {!!showCallIn && !skipped && setSkipped && !testMode &&
          <button className="btn px-2 py-0 btn-outline-dark ml-2" onClick={() => setSkipped(_id)}>
            Skip
          </button>}
          <div className="ml-auto d-none">
            {addToGroup && !testMode &&
            <button className="d-none btn px-2 py-0 btn-outline-dark" onClick={() => addToGroup(_id)}>
              Add to Group
            </button>}
            {leaveFromGroup && showLeave && !testMode &&
            <button className="btn px-2 py-0 btn-outline-dark" onClick={() => leaveFromGroup(_id)}>
              Remove from group
            </button>}
          </div>
        </div>
      </div>
    </div>
  )
}
