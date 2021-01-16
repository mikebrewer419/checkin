import React, { Component } from 'react'
import cometInject from './comet-inject'
import List from '../CheckinList'
import {
  getStudioByUri,
  getOneSession,
  createCometRoom
} from '../../services'
import './style.scss'
import { FaMinus } from 'react-icons/fa'

class HomePage extends Component {
  constructor(props) {
    super(props)
    let search = window.location.search.substring(1);
    let queryParams = {}
    try {
      queryParams = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
    } catch (err) {
      queryParams = {}
    }

    this.state = {
      studio: null,
      session: null,
      showChat: true,
      showList: true,
      jitsiKey: 0,
      groupCandidates: [],
      testMode: queryParams.test
    }
  }

  componentWillUnmount() {
    if (this.cometAuthScript) {
      this.cometAuthScript.parentElement.removeChild(this.cometAuthScript)
    }
    if (this.chatScriptSecondDom) {
      this.chatScriptSecondDom.parentElement.removeChild(this.chatScriptSecondDom)
    }
  }

  async componentDidMount() {
    const studio_uri = this.props.match.params.uri
    const session_id = this.props.match.params.session_id
    const studio = await getStudioByUri(studio_uri)
    const session = await getOneSession(session_id)

    this.setState({ studio, session })

    const pageTitle = this.state.testMode ? 'Virtual Lobby' : 'Video Chat'
    document.title = `${studio.name} ${pageTitle}`;

    await createCometRoom(studio._id, session._id)

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
    this.cometAuthScript = cometAuthScript

    if (!document.getElementById('chat')) return
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
      iframeObj.style="min-height:120px;min-width:300px;";
      iframeObj.src="https://54561.cometondemand.net/cometchat_embedded.php?guid=${studio._id}-${session._id}";
      iframeObj.width="100%";
      iframeObj.height="100%";
      if(typeof(addEmbedIframeExternal)=="function") {
        setTimeout(() => {
          addEmbedIframeExternal(iframeObj);
        }, 1000)
      }
    `
    document.body.appendChild(chatScriptSecondDom)
    this.chatScriptSecondDom = chatScriptSecondDom
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

  leaveFromGroup = (id) => {
    this.listRef.leaveFromGroup(id)
  }

  setListRef = (elem) => {
    this.listRef = elem
  }

  render() {
    const { studio, session, showChat, showList,
      jitsiKey, groupCandidates, testMode } = this.state
    if (!studio) {
      return <div>Loading...</div>
    }
    const meeting_id = testMode ? studio.test_meeting_id : studio.jitsi_meeting_id
    return (
      <div className="homepage-wrapper">
        <div className={"homepage " + (testMode ? 'test': '')}>
          <div id="checkin-list" className={`${showList?'show':''}`}>
            <div
              id="list"
            >
              <List
                ref={this.setListRef}
                testMode={testMode}
                studio={studio}
                session={session}
                messages={studio.position_messages}
                delete_message={studio.delete_message}
                setGroupCandidates={gcs => this.setState({ groupCandidates: gcs })}
              />
            </div>
            <button className="btn px-1 py-0 border-right-0" onClick={() => this.setShowList(!showList)}>
              {!showList ? '〉' :'〈' }
            </button>
          </div>
          <div className="right-frame">
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
            </div>
            <div className={`d-flex bottom-panel ${showChat ? 'show' : ''}`}>
              <button
                className="btn border-bottom-0 toggle-bottom"
                onClick={() => this.setshowChat(!showChat)}
              >
                {!showChat ? '〉' :'〈' }
              </button>
              {!testMode && (
                <div>
                  <div id="current-group" className="px-2">
                    <h6 className="mx-n2 px-2">
                      Current Group 
                    </h6>
                    <ul>
                      {groupCandidates.map(person => (
                        <li>
                          <div className="d-flex align-items-center">
                            <span className="mr-5">{person.first_name} ${person.last_name}</span>
                            <FaMinus className="text-danger cursor-pointer" size="16" onClick={() => {
                              this.leaveFromGroup(person._id)
                            }}/>
                          </div>
                        </li>
                      ))}
                    </ul>
                    {groupCandidates.length > 0 && [
                      <button key="finish" className="btn btn-sm btn-danger leave-group-btn" onClick={this.leaveCurrentGroup}>
                        Finish Group
                      </button>
                    ]}
                  </div>
                </div>
              )}
              <div id="comet-chat">
                <div id="chat"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default HomePage
