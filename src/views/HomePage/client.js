import React, { Component } from 'react'
import cometInject from './comet-inject'
import SizeCards from './SizeCards'
import PersonCard from '../PostingPage/PersonCard'
import {
  static_root,
  getStudioByUri,
  getOneSession,
  createCometRoom
} from '../../services'
import './style.scss'

class ClientHomePage extends Component {
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
    document.querySelector('.global-header').classList.remove('bg-success')
    document.querySelector('.global-header').classList.add('bg-danger')
    document.querySelector('.global-header button').classList.remove('btn-success')
    document.querySelector('.global-header button').classList.add('btn-danger')
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
    if (this.state.testMode) {
      document.querySelector('.global-header button').classList.remove('btn-danger')
      document.querySelector('.global-header button').classList.add('btn-success')
      document.querySelector('.global-header').classList.remove('bg-danger')
      document.querySelector('.global-header').classList.add('bg-success')
    }
    if (studio.logo) {
      document.querySelector('#header-logo').innerHTML = `<img src="${static_root+studio.logo}" class="header-logo" />`
    }

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

    document.querySelector('.right-frame').addEventListener('scroll', () => {
      let offsetTop = document.querySelector('.right-frame').scrollTop
      const threshold = window.innerHeight - 225
      if (offsetTop > threshold) {
        document.querySelector('#jitsi-frame').classList.add('mini-view')
      } else {
        document.querySelector('#jitsi-frame').classList.remove('mini-view')
      }
    })
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
      <div className="homepage-wrapper client">
        <div className={"homepage " + (testMode ? 'test': '')}>
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
            <div className="d-flex bottom-panel">
              <div className="current-group-size-cards-wrapper w-100">
                <h6 className="px-2 mb-0 mt-2">
                  Current Group 
                </h6>
                <div className="current-group-size-cards">
                  {groupCandidates.map(person => (
                    <PersonCard
                      key={person._id}
                      {...person}
                      studio={studio}
                      showNumber={true}
                      useSelfData={false}
                    />
                  ))}
                </div>
              </div>
            </div>
            <SizeCards
              studio={studio}
              session={session}
              setGroupCandidates={gcs => this.setState({ groupCandidates: gcs })}
            />
          </div>
          <div id="checkin-list" className={`${showList?'show':''}`}>
            <div id="comet-chat" className="client">
              <div id="chat"></div>
            </div>
            <button className="btn px-1 py-0 border-right-0" onClick={() => this.setShowList(!showList)}>
              {!showList ? '〉' :'〈' }
            </button>
          </div>
        </div>
      </div>
    )
  }
}

export default ClientHomePage
