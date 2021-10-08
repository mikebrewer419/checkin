import React, { Component } from 'react'
import cometInject from './comet-inject'
import SizeCards from './SizeCards'
import PersonCard from '../PostingPage/PersonCard'
import {
  static_root,
  getStudioByUri,
  getOneSession,
  fetchCheckInList,
  getCurrentGroup,
  createCometRoom
} from '../../services'
import { MEETING_HOST, WS_HOST } from '../../constants'
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
      candidates: [],
      testMode: queryParams.test,

      twrGroupCandidates: [],
      twrCandidates: [],
      listTab: 'heyjoe'
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

    const candidates = await fetchCheckInList(session._id)
    const currentGroup = await getCurrentGroup(session._id) || {}

    this.setState({
      studio,
      session,
      candidates: candidates.map((c, idx) => ({
        ...c,
        number: idx + 1
      })),
      groupCandidates: currentGroup.records.map(r => {
        return {
          ...r,
          number: candidates.findIndex(c => c._id === r._id) + 1
        }
      })
    })

    const pageTitle = this.state.testMode ? 'Virtual Lobby' : 'Video Chat'
    document.title = `${studio.name} ${pageTitle}`;
    document.querySelector('#header-title').innerHTML = studio.name
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

    const initWS = () => {
      console.log('WS connecting')
      this.ws = new WebSocket(WS_HOST)
      this.ws.onopen = () => {
        this.ws.send(JSON.stringify({
          meta: 'join',
          room: session._id
        }))
        setInterval(() => {
          console.log('ping')
          this.ws.send(JSON.stringify({ meta: 'ping' }))
          this.wstm = setTimeout(() => {
            console.log('WS disconnect detected')
          }, 50000)
        }, 30000)
      }
      this.ws.onclose = () => {
        console.log('WS onclose')
        initWS()
      }
      this.ws.onmessage = (event) => {
        try {
          const ev = JSON.parse(event.data)
          console.log('ev: ', ev);
          switch (ev.type) {
            case 'pong':
              clearTimeout(this.wstm)
              break
            case 'group':
              this.setState({
                groupCandidates: ev.data.records.map(r => {
                  return {
                    ...r,
                    number: this.state.candidates.findIndex(c => c._id === r._id) + 1
                  }
                })
              })
              break
            case 'record':
              const rIdx = this.state.candidates.findIndex(r => r._id === ev.data._id)
              const gIdx = this.state.groupCandidates.findIndex(r => r._id === ev.data._id)
              const gcs = this.state.groupCandidates.map((r, idx) => {
                return idx === gIdx ? {
                  ...ev.data,
                  number: idx + 1
                } : r
              })
              if (rIdx === -1) {
                this.setState({
                  candidates: this.state.candidates.concat(ev.data),
                  groupCandidates: gcs
                })
              } else {
                this.setState({
                  candidates: this.state.candidates.map((c, idx) => {
                    return idx === rIdx ? {
                      ...ev.data,
                      number: idx + 1
                    } : c
                  }),
                  groupCandidates: gcs
                })
              }
              break
          }
        } catch (err) {
          console.log('socket msg handle err: ', err);
        }
      }
    }

    initWS()
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

  reloadSession = async() => {
    const session_id = this.props.match.params.session_id
    const session = await getOneSession(session_id)

    this.setState({ session })
  }

  render() {
    const { studio, session, showChat, showList, candidates: hjCandidates,
      jitsiKey, groupCandidates: hjGroupCandidates, testMode,
      listTab, twrCandidates, twrGroupCandidates } = this.state

    const candidates = listTab === 'heyjoe' ? hjCandidates : twrCandidates
    const groupCandidates = listTab === 'heyjoe' ? hjGroupCandidates : twrGroupCandidates

    if (!studio) {
      return <div>Loading...</div>
    }
    const meeting_id = testMode ? studio.test_meeting_id : studio.jitsi_meeting_id
    return (
      <div className="homepage-wrapper client">
        <div className={"homepage " + (testMode ? 'test': '')}>
          <div className="right-frame">
            <div id="jitsi-frame" className="no-print">
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
                src={`${MEETING_HOST}/${meeting_id}`}
                allow="camera; microphone; fullscreen; display-capture"
                allowFullScreen="allowfullscreen">
              </iframe>
            </div>
            <div className="d-flex bottom-panel no-print">
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
                      commentRelateClick={true}
                      session_id={session._id}
                    />
                  ))}
                </div>
              </div>
            </div>
            <SizeCards
              studio={studio}
              session={session}
              
              candidates={candidates}

              setTwrGroupCandidates={gcs => this.setState({ twrGroupCandidates: gcs })}
              setTwrCandidates={cs => this.setState({ twrCandidates: cs })}

              setListTab={t => this.setState({ listTab: t })}
            />
          </div>
          <div id="checkin-list" className={`no-print ${showList?'show':''}`}>
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
