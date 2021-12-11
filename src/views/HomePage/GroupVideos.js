import React, { Component } from 'react'
import ReactPlayer from 'react-player'
import { Modal } from 'react-bootstrap'
import {
  static_root,
  getGroupVideos
} from '../../services'
import { WS_HOST } from '../../constants'
import './groupvideos.scss'

class GroupVideos extends Component {
  constructor(props) {
    super(props)

    this.state = {
      videos: [],
      selectedVideo: null
    }
  }

  componentDidMount() {
    this.loadVideos()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.groupId !== this.props.groupId) {
      this.loadVideos()
    }
  }

  initWS = () => {
    if (this.ws) { this.ws.close() }
    this.ws = new WebSocket(WS_HOST)
    this.ws.onopen = () => {
      this.ws.send(JSON.stringify({
        meta: 'join',
        room: this.props.groupId
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
      this.initWS()
    }
    this.ws.onmessage = (ev) => {
      try {
        const event = JSON.parse(ev.data)
        if (event.type === 'add-video') {
          this.setState({
            videos: this.state.videos.concat(event.data)
          })
        }
      } catch (err) {
        console.log('socket msg handle err: ', err);
      }
    }
  }

  loadVideos = async () => {
    const res = await getGroupVideos(this.props.groupId)
    this.setState({
      videos: res
    })
    this.initWS()
  }

  render () {
    const { videos, selectedVideo } = this.state

    return (
      <div className='group-videos'>
        {videos.map((video, index) => {
          return (
            <div key={video.uri} className='video-item' onClick={() => {
              this.setState({
                selectedVideo: video
              })
            }}>
              <div className="index-indicator">
                { index + 1 }
              </div>
              <img
                className="dummy-player"
                src={static_root+video.thumbnail}
              />
            </div>
          )
        })}

        <Modal
          size="xl"
          show={selectedVideo}
          onHide={() => {
            this.setState({ selectedVideo: null })
          }}
        >
          <Modal.Body>
            {selectedVideo && (
              <ReactPlayer
                key={selectedVideo.uri}
                controls={true}
                url={static_root+selectedVideo.uri}
                id="active-player"
                className="w-100 pb-3"
                height="100%"
              />
            )}
          </Modal.Body>
          <Modal.Footer>
            <button className='btn btn-danger' onClick={() => {
              this.setState({ selectedVideo: null })
            }}>
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default GroupVideos
