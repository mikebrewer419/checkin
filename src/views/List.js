import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import {
  sendMessage,
  fetchCheckInList,
  updateRecordField,
  removeCheckinRecord,
  static_root
} from '../api'
import './List.css'

const messages = [
  "It's now your turn to audition, please enter 'STUDIO_NAME' into the app and click 'create/join",
  "You are on deck! We'll text you shortly to join the casting.",
  "Please head to Southpaw Studios and wait on the patio. You are 2nd in line",
  "Be prepared, you are next in line to head to Southpaw Studios. We will contact you shortly",
]

const deletedMessageText = 'You arrived at the wrong time. Please come back at the correct call time and check in again.'

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
      studio_id: this.props.studio_id,
      studio: this.props.studio,
      studio_logo: this.props.studio_logo
    }
    this.interval = 30000 // query api every 30 seconds
    this.messages = this.props.messages || messages
    this.deletedMessageText = this.props.delete_message || deletedMessageText
  }

  componentDidMount() {
    this.meeting_id = this.props.meeting_id
    this.fetchData()
    setInterval(() => {
      this.fetchData()
    }, this.interval)
  }

  fetchData = () => {
    return fetchCheckInList(this.state.studio_id, this.meeting_id).then(data => {
        this.setState({
          candidates: data,
          loading: false
        })
      }).catch(err => {
        console.log("App -> componentDidMount -> err", err)
      })
  }

  setSkipped = (id) => {
    const vm = this
    this.setState({
      loading: true
    })
    updateRecordField(id, {
      skipped: true
    }).then(data => {
      let idx = vm.state.candidates.findIndex(p => p._id === id) + 1
      for(let i = 1; i < 2 && vm.state.candidates[idx] && idx < vm.state.candidates.length; i ++, idx ++) {
        if (!vm.state.candidates[idx].dont_message) {
          sendMessage({
            to: vm.state.candidates[idx].phone,
            body: this.messages[i]
          }, this.state.studio_id, this.state.studio)
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
    this.setState({
      loading: true
    })
    updateRecordField(id, {
      seen: true,
      call_in_time: new Date().toISOString()
    }).then(data => {
      let idx = vm.state.candidates.findIndex(p => p._id === id)
      if (vm.state.candidates[idx].skipped) {
        if (!vm.state.candidates[idx].dont_message) {
          sendMessage({
            to: vm.state.candidates[idx].phone,
            body: this.messages[0]
          }, this.state.studio_id, this.state.studio)
        }
      } else {
        for(let i = 0; i < 2 && vm.state.candidates[idx] && idx < vm.state.candidates.length; i ++, idx ++) {
          if (!vm.state.candidates[idx].dont_message) {
            sendMessage({
              to: vm.state.candidates[idx].phone,
              body: this.messages[i]
            }, this.state.studio_id, this.state.studio)
          }
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
          }, this.state.studio_id, this.state.studio)
        }
        let idx = vm.state.candidates.findIndex(p => (!p.seen && !p.skipped)) || vm.state.candidates.length
        for(let i = 1;
            i < 2 && vm.state.candidates[idx] && idx < vm.state.candidates.length
            && removedIdx <= idx;
            i ++, idx ++) {
          if (!vm.state.candidates[idx].dont_message) {
            sendMessage({
              to: vm.state.candidates[idx].phone,
              body: this.messages[i]
            }, this.state.studio_id, this.state.studio)
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
    sendMessage(this.state.message, this.state.studio_id, this.state.studio)
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

  render() {
    return (
      <div className="list-view">
        <div className={`loading ${this.state.loading?'show':''}`}>
          Processing...
        </div>
        <div className="d-flex flex-column">
          <div className="studio-header">
            <div className="logo">
              <Link to="/">
                <img src={static_root+this.state.studio_logo} alt={this.state.studio}/>
              </Link>
            </div>
            <h2 style={{textAlign: "center"}}> {this.state.studio}</h2>
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

const PersonCard = ({
  idx,
  _id,
  showCallIn,
  first_name,
  last_name,
  email,
  phone,
  skipped,
  seen,
  signed_out,
  checked_in_time,
  dont_message,
  setSeen,
  setSkipped,
  signOut,
  removeRecord
}) => {
  const dateString = new Date(checked_in_time).toLocaleString("en-US", {timeZone: "America/Los_Angeles"})

  return (
    <div className="card">
      <div className="card-body">
        <h5 className="card-title mb-0">
          <span className={seen?'text-success':'text-danger'} >
            ⬤
          </span>&nbsp;&nbsp;
          {first_name} {last_name}
          {dont_message &&
          <small>&nbsp;&nbsp;no message</small>}
          {skipped &&
          <small>&nbsp;&nbsp;skipped</small>}
          <button
            className="btn px-2 py-0 btn-outline-dark float-right"
            onClick={() => removeRecord(_id, phone, idx)}
          >Delete</button>
          {seen && !signed_out && (
            <button
              className="btn px-2 py-0 btn-outline-dark"
              onClick={() => signOut(_id)}
            >SignOut</button>
          )}
          {signed_out &&
            <small className="float-right mr-3 mt-1">Signed out</small>}
        </h5>
        <p className="card-text">
          <small>{_id}</small>
        </p>
        <p className="card-text">Phone: {phone}</p>
        <p className="card-text">Email: {email}</p>
        <p className="card-text">Checked In: {dateString}</p>
        {(!!showCallIn || skipped) &&
        <button className="btn px-2 py-0 btn-outline-dark" onClick={() => setSeen(_id)}>
          Call In
        </button>}
        &nbsp;&nbsp;
        {!!showCallIn && !skipped &&
        <button className="btn px-2 py-0 btn-outline-dark" onClick={() => setSkipped(_id)}>
          Skip
        </button>}
      </div>
    </div>
  )
}
