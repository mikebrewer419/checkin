import React, { Component } from 'react'
import cometInject from './comet-inject'
import List from '../CheckinList'
import {
  getStudioByUri,
  getOneSession,
  createCometRoom,
  fetchCheckInList,
  getCurrentGroup,
  static_root
} from '../../services'
import './style.scss'
import { FaMinus } from 'react-icons/fa'
import { WS_HOST } from '../../constants'
import MeetFrame from './MeetFrame'
import SizeCards from './SizeCards'

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
      candidates: [],
      testMode: queryParams.test,

      twrGroupCandidates: [],
      twrCandidates: [],
      listTab: 'heyjoe',
    }
  }

  componentWillUnmount() {
    const header = document.querySelector('.global-header')
    if (header) {
      header.classList.remove('bg-success')
      header.classList.add('bg-danger')
    }
    const headerBtn = document.querySelector('.global-header button')
    if (headerBtn) {
      headerBtn.classList.remove('btn-success')
      headerBtn.classList.add('btn-danger')
    }
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
      groupCandidates: currentGroup.records
    })

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
                groupCandidates: ev.data.records
              })
              break
            case 'record':
              const rIdx = this.state.candidates.findIndex(r => r._id === ev.data._id)
              if (rIdx === -1) {
                this.setState({
                  candidates: this.state.candidates.concat({
                    ...ev.data,
                    number: this.state.candidates.length + 1
                  })
                })
              } else {
                this.setState({
                  candidates: this.state.candidates.map((c, idx) => {
                    return idx === rIdx ? {
                      ...ev.data,
                      number: idx + 1
                    } : c
                  })
                })
              }
              break
            case 'record-remove':
              this.setState({
                candidates: this.state.candidates.filter(c => c._id !== ev.data).map((c, idx) => {
                  return {
                    ...c,
                    number: idx + 1
                  }
                })
              })
              break
            case 'clear-records':
              this.setState({ candidates: [] })
              break
          }
        } catch (err) {
          console.log('socket msg handle err: ', err);
        }
      }
    }

    initWS()
  }

  reloadSession = async() => {
    const session_id = this.props.match.params.session_id
    const session = await getOneSession(session_id)

    this.setState({ session })
  }

  setshowChat = (v) => {
    this.setState({
      showChat: v
    })
    if (!v) {
      document.querySelector('#comet-chat').style.display = 'none'
      this.chatWindowHandle = window.open(document.querySelector('#comet-chat iframe').src, 'MsgWindow', 'width=800px,height=400px;')
    } else {
      document.querySelector('#comet-chat').style.display = 'block'
      if (this.chatWindowHandle) {
        this.chatWindowHandle.close()
      }
    }
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
    const { studio, session, showChat, showList, candidates: hjCandidates,
      jitsiKey, groupCandidates: hjGroupCandidates, testMode,
      listTab, twrCandidates, twrGroupCandidates } = this.state
    if (!studio) {
      return <div>Loading...</div>
    }
    const candidates = listTab === 'heyjoe' ? hjCandidates : twrCandidates
    const groupCandidates = listTab === 'heyjoe' ? hjGroupCandidates : twrGroupCandidates
    const meeting_id = testMode ? studio.test_meeting_id : studio.jitsi_meeting_id
    const isTwr = listTab === 'twr'

    const rs = []
    candidates.forEach(c => {
      if (c.role && !rs.includes(c.role)) {
        rs.push(c.role)
      }
    })
    rs.sort((a, b) => a.localeCompare(b))

    return (
      <div className="homepage-wrapper">
        <div className={"homepage " + (testMode ? 'test': '')}>
          <div id="checkin-list" className={`no-print ${showList?'show':''}`}>
            <div
              id="list"
            >
              <List
                ref={this.setListRef}
                testMode={testMode}
                studio={studio}
                session={session}
                reloadSession={this.reloadSession}
                messages={studio.position_messages}
                delete_message={studio.delete_message}
                candidates={candidates}
                groupCandidates={groupCandidates}
                roles={rs}
                setTwrGroupCandidates={gcs => this.setState({ twrGroupCandidates: gcs })}
                setTwrCandidates={cs => this.setState({ twrCandidates: cs })}
                setListTab={t => this.setState({ listTab: t })}
              />
            </div>
            <button className="btn px-1 py-0 border-right-0" onClick={() => this.setShowList(!showList)}>
              {!showList ? '〉' :'〈' }
            </button>
          </div>
          <div className="right-frame">
            <div className="frame-wrapper no-print">
              <MeetFrame meeting_id={meeting_id} />
              <div className={`d-flex bottom-panel ${showChat ? 'show' : ''}`}>
                <button
                  className="btn border-bottom-0 toggle-bottom"
                  onClick={() => this.setshowChat(!showChat)}
                  title="Click to toggle current group and chat window."
                >
                  {!showChat ? '〉' :'〈' }
                </button>
                {!testMode && (
                  <div>
                    <div id="current-group" className="px-2">
                      <h6 className="mx-n2 px-2">
                        Current Group { isTwr ? '(TWR)' : '' }
                      </h6>
                      <ul>
                        {groupCandidates.map(person => (
                          <li key={person._id}>
                            <div className="d-flex align-items-center">
                              <span className="mr-5">{person.first_name} ${person.last_name}</span>
                              {person.twr_deleted && <div className="mr-2">
                                <small>Deleted</small>
                              </div>}
                              <FaMinus className="text-danger cursor-pointer ml-auto mr-2" size="16" onClick={() => {
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
            <SizeCards
              studio={studio}
              session={session}
              isClient={false}
              candidates={candidates}
              roles={rs}

              setTwrGroupCandidates={gcs => this.setState({ twrGroupCandidates: gcs })}
              setTwrCandidates={cs => this.setState({ twrCandidates: cs })}

              isTwr={isTwr}
              listTab={listTab}
              setListTab={t => this.setState({ listTab: t })}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default HomePage
