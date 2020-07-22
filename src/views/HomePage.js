import React, { Component } from 'react'
import cometInject from '../comet-inject'
import List, { PersonCard } from './List'
import {
  getStudioByUri,
  createCometRoom
} from '../api'
import './HomePage.css'

class HomePage extends Component {
  constructor(props) {
    super(props)

    this.state = {
      studio: null,
      showChat: true,
      showList: true,
      jitsiKey: 0,
      groupCandidates: []
    }
  }

  async componentDidMount() {
    const studio_uri = this.props.match.params.uri
    const meeting_id = this.props.match.params.meeting_id
    const studio = await getStudioByUri(studio_uri)

    console.log("HomePage -> componentDidMount -> studio", studio)
    if (!studio || !studio.jitsi_meeting_ids.includes(meeting_id)) { return }

    this.setState({ studio })

    document.title = `${studio.name} Check In List`;

    await createCometRoom(studio._id, meeting_id)

    let cometAuthScript = document.createElement('script')
    cometAuthScript.innerHTML = `
      var chat_appid = '${studio.comet_chat_appid}';
      var chat_auth = '${studio.comet_chat_auth}';

      (function() {
        var chat_css = document.createElement('link');
        chat_css.rel = 'stylesheet';
        chat_css.type = 'text/css';
        chat_css.href = 'https://fast.cometondemand.net/'+chat_appid+'x_xchat.css';
        document.getElementsByTagName("head")[0].appendChild(chat_css);
      })();

      ${cometInject}
    `
    document.body.appendChild(cometAuthScript)

    document.getElementById('chat').innerHTML = `
      <div
        id="cometchat_embed_chatrooms_container"
        style="display: inline-block;">
      </div>
    `

    const email = window.localStorage.getItem('email')

    let chatScriptSecondDom = document.createElement('script')
    chatScriptSecondDom.innerHTML = `
      var chat_id = '${email}';
      var chat_name = '${email}';
      var chat_avatar = '';
      var chat_link = '#';
      var chat_role = 'Guest';

      var iframeObj = {};
      iframeObj.module="chatrooms";
      iframeObj.style="min-height:420px;min-width:300px;";
      iframeObj.src="https://54561.cometondemand.net/cometchat_embedded.php?guid=${studio._id}-${meeting_id}";
      iframeObj.width="100%";
      iframeObj.height="100%";
      if(typeof(addEmbedIframeExternal)=="function") {
        setTimeout(() => {
          addEmbedIframeExternal(iframeObj);
        }, 1000)
      }
    `
    document.body.appendChild(chatScriptSecondDom)
  }

  setshowChat = (v) => {
    this.setState({
      showChat: v
    })
  }

  setShowList = (v) => {
    this.setState({
      showList: v
    })
  }

  reloadJitsi = () => {
    this.setState({
      jitsiKey: this.state.jitsiKey + 1
    })
  }

  leaveCurrentGroup = () => {
    this.listRef.finishCurrentGroup()
  }

  setListRef = (elem) => {
    this.listRef = elem
  }

  render() {
    const { studio, showChat, showList, jitsiKey, groupCandidates } = this.state
    const meeting_id = this.props.match.params.meeting_id
    if (!studio) {
      return <div>Loading...</div>
    }
    return (
      <div className="homepage">
        <div id="checkin-list" className={`${showList?'show':''}`}>
          <div id="list">
            <List
              ref={this.setListRef}
              studio_id={studio._id}
              studio={studio.name}
              studio_logo={studio.logo}
              messages={studio.position_messages}
              delete_message={studio.delete_message}
              meeting_id={meeting_id}
              setGroupCandidates={gcs => this.setState({ groupCandidates: gcs })}
            />
          </div>
          <button className="btn px-1 py-0 border-right-0" onClick={() => this.setShowList(!showList)}>
            {!showList ? '〉' :'〈' }
          </button>
        </div>
        <div id="jitsi-frame">
          <button
            id="reload-jitsi"
            title="Reload Meeting frame"
            onClick={this.reloadJitsi}
          >⟳</button>
          <iframe
            key={jitsiKey}
            title="Meeting"
            width="100%"
            height="100%"
            id="jitsi-meeting-frame"
            src={`https://meet.heyjoe.io/${meeting_id}`}
            allow="microphone,camera"
            allowFullScreen="allowfullscreen">
          </iframe>
          <div id="current-group" className="px-2">
            <h4>Current Group  (<small> {groupCandidates[0] && groupCandidates[0].group} </small>)</h4>
            <div className="d-flex flex-wrap">
              {groupCandidates.map(person => (
                <PersonCard
                  key={person._id}
                  id={person._id}
                  idx={person._id}
                  showCallIn={false}
                  {...person}
                  hideDelete={true}
                />
              ))}
            </div>
            {groupCandidates.length > 0 &&
            <button className="btn btn-sm btn-danger leave-group-btn" onClick={this.leaveCurrentGroup}>
              Finish Group
            </button>}
          </div>
        </div>
        <div id="comet-chat" className={`${showChat?'show':''}`}>
          <button className="btn px-1 py-0 border-right-0" onClick={() => this.setshowChat(!showChat)}>
            {showChat ? '〉' :'〈' }
          </button>
          <div id="chat"></div>
        </div>
      </div>
    )
  }
}

export default HomePage
