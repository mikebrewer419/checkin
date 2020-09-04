import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import { FaTimes, FaDownload, FaMinus } from 'react-icons/fa'
import moment from 'moment'
import {
  sendMessage,
  fetchCheckInList,
  updateRecordField,
  setRecordsGroup,
  updateManyRecords,
  removeCheckinRecord,
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
      studio: this.props.studio,
      session: this.props.session,
      currentGroup: ''
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

  fetchData = () => {
    const { session } = this.props
    return fetchCheckInList(session._id).then(data => {
      const { group } = data.filter((candidate, idx) => {
        return !candidate.seen &&
        (idx === 0 ||
          (data[idx - 1] &&
            (data[idx - 1].seen || data[idx - 1].skipped)
          )
        )
      })[0] || {}
      this.setState({
        candidates: data,
        currentGroup: this.state.currentGroup || group || '',
        loading: false
      }, () => {
        const inGroupCandidates = this.state.candidates.filter(c => c.group && (c.group === this.state.currentGroup))
        this.props.setGroupCandidates(inGroupCandidates)
      })
    }).catch(err => {
      console.log("App -> componentDidMount -> err", err)
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
        if (!vm.state.candidates[idx].skipped && i !== 0) {
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

  callInCurrentGroup = () => {
    const vm = this
    const { studio } = this.props
    this.setState({
      loading: true
    })
    if (!this.state.currentGroup) return
    const groupRecordIds = this.state.candidates.filter(c => c.group === this.state.currentGroup)
      .map(record => record._id)
    updateManyRecords(groupRecordIds, {
      seen: true
    }).then(data => {
      let idx = vm.state.candidates.findIndex(p => !p.seen)
      for(let i = 0; i < 2 && vm.state.candidates[idx] && idx < vm.state.candidates.length; i ++, idx ++) {
        if (!vm.state.candidates[idx].skipped) {
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
    updateRecordField(id, {
      signed_out: true,
      signed_out_time: new Date().toISOString()
    }).then(() => {
      this.fetchData()
    })
  }

  addToGroup = (_id) => {
    const { currentGroup } = this.state
    const currentCandidate = this.state.candidates.filter(c => c._id === _id)[0]
    let newGroup = this.state.currentGroup
    let newCandidates = JSON.parse(JSON.stringify(this.state.candidates))
    const cname = `${currentCandidate.first_name} ${currentCandidate.last_name}`
    newGroup = currentGroup.split(',').concat(cname).filter(s => s).join(',')

    newCandidates = this.state.candidates.map(candidate => {
      if (candidate._id === _id || (this.state.currentGroup && candidate.group === this.state.currentGroup)) {
        return {
          ...candidate,
          group: newGroup
        }
      }
      return candidate
    })

    this.setState({
      currentGroup: newGroup,
      candidates: newCandidates
    }, this.saveCurrentGroupInfo)
  }

  leaveFromGroup = (_id) => {
    let currentCandidate = this.state.candidates.filter(c => c._id === _id)[0]
    const cname = `${currentCandidate.first_name} ${currentCandidate.last_name}`
    const newGroup = this.state.currentGroup.split(',').filter(g => g !== cname).join(',')
    let newCandidates = this.state.candidates.map(c => {
      if (c._id === _id) {
        return {
          ...c,
          group: ''
        }
      }
      return {
        ...c,
        group: c.group === this.state.currentGroup ? newGroup : c.group
      }
    })
    this.setState({
      candidates: newCandidates,
      currentGroup: newGroup
    }, this.saveCurrentGroupInfo)
  }

  saveCurrentGroupInfo = async () => {
    this.setState({ loading: true })
    const data = this.state.candidates.map(c => ({ _id: c._id, group: c.group }))
    await setRecordsGroup(data)
    await this.fetchData()
    this.setState({ loading: false })
  }

  finishCurrentGroup = () => {
    if (!this.state.currentGroup) return
    const remainingCandidates = this.state.candidates.filter(c => c.group === this.state.currentGroup && !c.seen)
    if (remainingCandidates.length > 0) {
      window.alert('You still have not seen candidates!')
      return
    }
    this.setState({
      currentGroup: ''
    })
    this.props.setGroupCandidates([])
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
    link.setAttribute("download", `${this.state.studio}-${(new Date()).toISOString()}.csv`)
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
            <h2 className="mb-3 text-center pr-3">
              <span>{studio.name}</span>
              &nbsp;
              <span>{session.name}</span>
              <span className="d-inline-block ml-2">Video Chat</span>
              <FaDownload
                title="Download CSV"
                className="ml-3 download-csv text-danger"
                onClick={this.downloadCSV}
              />
            </h2>
          </div>
          <ul className="list-group">
            {this.state.candidates && this.state.candidates.map((person, idx) => {
              const showCallIn = !this.state.candidates[idx].seen &&
                (idx === 0 ||
                (this.state.candidates[idx - 1] &&
                  (this.state.candidates[idx - 1].seen ||
                  this.state.candidates[idx - 1].skipped)))
              const addToGroup = !person.group ? this.addToGroup : null
              const leaveFromGroup = person.group && person.group === this.state.currentGroup ? this.leaveFromGroup : null
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
                  addToGroup={addToGroup}
                  leaveFromGroup={leaveFromGroup}
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
  showLeave
}) => {
  const dateString = formatTime(checked_in_time)

  return (
    <div className="card text-primary border-0">
      <div className="card-body pr-1">
        <div className="card-title d-flex align-items-center mb-0">
          <h4 className="mr-2 cursor-pointer" onClick={() => {
            if (addToGroup) {
              addToGroup(_id)
            }
          }}>
            {!seen && <small className="mr-2">🔴</small>}
            {first_name} {last_name}
          </h4>
          {skipped &&
          <small>&nbsp;&nbsp;skipped</small>}
          {/* {seen && !signed_out && signOut && (
            <button
              className="btn px-2 py-0 btn-outline-dark"
              onClick={() => signOut(_id)}
            >SignOut</button>
          )}
          {signed_out &&
            <small className="float-right mr-3 mt-1">Signed out</small>} */}
          <small className="card-text mb-0">
            <small>Checked In:</small>
            <span className="ml-2">{dateString}</span>
          </small>
          {!hideDelete && (
            <FaTimes className="text-danger ml-auto mr-3 cursor-pointer" onClick={() => removeRecord(_id, phone, idx)} />
          )}
          {showLeave && leaveFromGroup && (
            <FaMinus className="text-danger ml-auto mr-3 cursor-pointer" onClick={() => leaveFromGroup(_id)} />
          )}
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
          <button className="btn px-2 py-0 btn-outline-dark d-none" onClick={() => setSkipped(_id)}>
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
