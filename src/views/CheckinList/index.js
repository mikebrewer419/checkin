import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FaCircle, FaTimes, FaDownload, FaMinus,
  FaSignOutAlt, FaFilm, FaListOl, FaUserFriends } from 'react-icons/fa'
import moment from 'moment'
import {
  sendMessage,
  fetchCheckInList,
  updateRecordField,
  removeCheckinRecord,

  addRecordToCurentGroup,
  removeRecordFromCurrentGroup,
  getCurrentGroup,
  finishCurrentGroup,

  static_root
} from '../../services'
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
    }
    this.interval = 30000 // query api every 30 seconds
    this.messages = this.props.messages || messages
    this.deletedMessageText = this.props.delete_message || deletedMessageText
  }

  componentDidMount() {
    this.fetchData()
    setInterval(() => {
      this.fetchData()
    }, this.interval)
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
      for(let i = 1; i < 2 && vm.state.candidates[idx] && idx < vm.state.candidates.length; i ++, idx ++) {
        if (!vm.state.candidates[idx].skipped) {
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
      for(let i = 0; i < 2 && vm.state.candidates[idx] && idx < vm.state.candidates.length; i ++, idx ++) {
        if (!vm.state.candidates[idx].skipped || i === 0) {
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
            i < 2 && vm.state.candidates[idx] && idx < vm.state.candidates.length
            && removedIdx <= idx;
            i ++, idx ++) {
          if (!vm.state.candidates[idx].skipped) {
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
    const { studio, session } = this.props
    return (
      <div className="list-view">
        <div className="d-flex flex-column">
          <div className="studio-header">
            <div className="logo">
              <Link to="/">
                <img src={static_root + studio.logo} alt={studio.name}/>
              </Link>
            </div>
            <h4 className="mb-3 text-center">
              <span>{studio.name}</span>
              &nbsp;
              <span>{session.name}</span>
              <span className="d-inline-block ml-2">Video Chat</span>

              <div className="d-flex justify-content-center">
                <Link
                  title="Video Review"
                  to={`/video/${studio.uri}/${session._id}`} 
                  target="_blank"
                  className="mx-3"
                >
                  <FaFilm size="16" className="text-danger" />
                </Link>
                <Link
                  title="Session Check-In"
                  to={`/onboard/${studio.uri}/${session._id}`}
                  target="_blank"
                  className="mx-3"
                >
                  <FaListOl size="16" className="text-danger" />
                </Link>
                <a
                  title="Client Page"
                  href={`https://live.heyjoe.io/project/${studio.client_link}`}
                  target="_blank"
                  className="mx-3"
                >
                  <FaUserFriends size="20" className="text-danger" />
                </a>
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
              </div>
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
                  showCallIn={showCallIn}
                  {...person}
                  setSeen={this.setSeen}
                  setSkipped={this.setSkipped}
                  removeRecord={this.removeRecord}
                  signOut={this.signOut}
                  addToGroup={this.addToGroup}
                  leaveFromGroup={this.leaveFromGroup}
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
  setSeen,
  setSkipped,
  signOut,
  removeRecord,
  addToGroup,
  leaveFromGroup,
  hideDelete,
  showLeave,
  groups
}) => {
  const dateString = formatTime(checked_in_time)

  return (
    <div className="card text-primary border-0">
      <div className="card-body pr-1">
        <div className="card-title d-flex align-items-center mb-0">
          <h5 className="mr-2 cursor-pointer d-flex align-items-center cursor-pointer" onClick={() => {
            if (addToGroup) {
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
            {seen && !signed_out && signOut && (
              <FaSignOutAlt
                className="text-danger ml-auto mr-1 cursor-pointer"
                onClick={() => signOut(_id)}
              />
            )}
            {!hideDelete && (
              <FaTimes className="text-danger mx-1 cursor-pointer" onClick={() => removeRecord(_id, phone, idx)} />
            )}
            {showLeave && leaveFromGroup && (
              <FaMinus className="text-danger mx-1 cursor-pointer" onClick={() => leaveFromGroup(_id)} />
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
          </div>
          <p className="card-text mb-0 flex-wrap d-none">
            <span>Group:</span>
            <strong className="ml-2">{group || 'no group'}</strong>
          </p>
        </div>
        <div className="d-flex mt-1">
          {(!!showCallIn || (!seen && skipped)) && setSeen &&
          <button className="btn px-2 py-0 btn-outline-dark" onClick={() => setSeen(_id)}>
            Call In SMS
          </button>}
          {!!showCallIn && !skipped && setSkipped &&
          <button className="btn px-2 py-0 btn-outline-dark ml-2" onClick={() => setSkipped(_id)}>
            Skip
          </button>}
          <div className="ml-auto d-none">
            {addToGroup &&
            <button className="d-none btn px-2 py-0 btn-outline-dark" onClick={() => addToGroup(_id)}>
              Add to Group
            </button>}
            {leaveFromGroup && showLeave &&
            <button className="btn px-2 py-0 btn-outline-dark" onClick={() => leaveFromGroup(_id)}>
              Remove from group
            </button>}
          </div>
        </div>
      </div>
    </div>
  )
}
