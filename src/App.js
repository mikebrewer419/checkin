import React, { useEffect, useState } from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { IconContext } from "react-icons";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Modal } from 'react-bootstrap'
import { verityToken, getUser, super_admins, getNotification } from './services'
import Login from './views/Auth/Login'
import ResetPasswordRequest from './views/Auth/ResetPasswordRequest'
import ResetPassword from './views/Auth/ResetPassword'
import Register from './views/Auth/Register'
import CheckinPage from './views/HomePage'
import ClientCheckinPage from './views/HomePage/client'
import ClientHomePage from './views/ClientPage'
import RecordMessagePage from './views/RecordMessagePage'
import Onboard from './views/Onboard'
import VideoPage from './views/VideoReview'
import PostingPage from './views/PostingPage'
import StudioList from './views/studio/list'
import SessionList from './views/Sessions'
import AdminView from './views/Admin'
import Header from './components/Header'
import { USER_TYPES } from './constants'

import './App.scss'

function App() {
  const [logo, setLogo] = useState('')
  const [email, setEmail] = useState({})
  const [notification, setNotification] = useState({})
  const [showNotification, setShowNotification] = useState(false)

  useEffect(() => {
    if (window.location.pathname.indexOf('/onboard') !== -1) {
      return
    }
    if (window.location.pathname.indexOf('/message') !== -1) {
      return
    }
    verityToken().then(async (email) => {
      console.log('email: ', email)
      setEmail(email)
      window.localStorage.setItem('email', email)
      if (window.location.pathname === '/login') {
        const pUrl = window.localStorage.getItem('prev_url') || '/'
        window.localStorage.removeItem('prev_url')
        window.location.href = pUrl
        return
      }
      const user = getUser()
      console.log("App -> user", user)
      if (user.logo) {
        setLogo(user.logo)
      }
      let chatScriptDom = document.createElement('script')
      chatScriptDom.src = '//fast.cometondemand.net/54561x_x782c3x_xcorex_xembedcode.js?v=7.48.6.1'
      document.body.appendChild(chatScriptDom)

      let n = await getNotification()
      n = n || {}
      setNotification(n)
      setShowNotification(n.notification && `${n.notification_updated_at}` !== window.localStorage.getItem('n_updated_at'))
    }, () => {
      if (window.location.pathname !== '/login') {
        if ([
          '/reset-password-request',
          '/reset-password',
          '/register'
        ].includes(window.location.pathname)) {
          return
        }
        window.localStorage.setItem('prev_url', window.location.href)
        window.localStorage.removeItem('email')
        window.location.href = '/login'
      }
    })
  }, [])

  const recaptchaKey = process.env.REACT_APP_RECAPTCHA_KEY
  const user = getUser() || {}

  const HP = user.user_type === USER_TYPES.CLIENT ? ClientCheckinPage : CheckinPage

  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <IconContext.Provider value={{ className: "global-class-name" }}>
        <div className={`loading`}>
          Processing...
        </div>
        <Router>
          <Header logo={logo} />
          <Switch>
            <Route path="/login" component={() => <Login />} exact />
            <Route path="/reset-password-request" component={() => <ResetPasswordRequest />} exact />
            <Route path="/reset-password" component={() => <ResetPassword />} exact />
            <Route path="/register" component={() => <Register />} exact />
            {user.user_type === USER_TYPES.SUPER_ADMIN &&
              <Route path="/heyjoe-admin" component={AdminView} />
            }
            <Route path="/message/:record_id" component={RecordMessagePage} />
            <Route path="/studio/:uri/:session_id" component={HP} />
            <Route path="/onboard/:uri/:session_id" component={Onboard} />
            {!(user.user_type === USER_TYPES.CLIENT) &&
              <Route path="/video/:uri/:session_id" component={props => <VideoPage setLogo={setLogo} {...props} />} />
            }
            <Route path="/posting-page/:uri/:postingpage_id" component={props => <PostingPage setLogo={setLogo} {...props} />} />
            <Route path="/" component={HomeBomponent} />
          </Switch>
        </Router>
        <Modal
          show={!!showNotification}
          onHide = {() => { setShowNotification(false) }}
          className="notification-modal"
        >
          <Modal.Header closeButton>
            <h5 className="mb-0">
              Feature Update
            </h5>
          </Modal.Header>
          <Modal.Body>
            <div className="notification-content" dangerouslySetInnerHTML={{__html: notification.notification}} />
            <div className="mt-2">
              <button className="btn btn-primary" onClick={() => {
                window.localStorage.setItem('n_updated_at', notification.notification_updated_at)
                setShowNotification(false)
              }}>
                Ok, Got it.
              </button>
            </div>
          </Modal.Body>
        </Modal>
      </IconContext.Provider>
    </GoogleReCaptchaProvider>
  );
}

const HomeBomponent = (props) => {
  const user = getUser()
  if (!user) {
    return null
  }
  if (user.user_type === USER_TYPES.CLIENT) {
    return <ClientHomePage />
  }
  if (user.user_type === USER_TYPES.SESSION_MANAGER) {
    return <SessionList {...props} />
  } else {
    return <StudioList {...props} />
  }
}

export default App;
