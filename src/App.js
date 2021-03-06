import React, { useEffect, useReducer, useState } from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { Provider } from 'react-redux'
import { IconContext } from "react-icons";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { Modal } from 'react-bootstrap'
import { verityToken, getUser, getNotification, getVersion } from './services'
import Login from './views/Auth/Login'
import ResetPasswordRequest from './views/Auth/ResetPasswordRequest'
import ResetPassword from './views/Auth/ResetPassword'
import Register from './views/Auth/Register'
import ClientRegister from './views/Auth/ClientRegister'
import TalentRegister from './views/Auth/TalentRegister'
import CheckinPage from './views/HomePage'
import ClientCheckinPage from './views/HomePage/client'
import ClientHomePage from './views/ClientPage'
import RecordMessagePage from './views/RecordMessagePage'
import Onboard from './views/Onboard'
import VideoPage from './views/VideoReview'
import PostingPage from './views/PostingPage'
import StudioList from './views/Studio/List'
import SessionManagerPage from './views/SessionManagerPage'
import FreelancerProfilePage from './views/SessionManagerPage/FreelancerProfile'
import AdminView from './views/Admin'
import TalentPage from './views/TalentPage'
import FindFreelancer from './views/Session/FindFreelancer';
import ProjectInvite from './views/Studio/Invite'
import Error404 from './views/Errors/404'
import Header from './components/Header'
import PrivateRoute from './components/PrivateRoute'
import { USER_TYPES, VERSION } from './constants'
import { TitleContext } from './Context';
import {ShowLoadingContext} from './Context'
import { AuthContext } from './hooks/auth'

import store from './store'

import './App.scss'
import '../node_modules/react-big-calendar/lib/css/react-big-calendar.css'

const state = 0
const reducer = (state, action) => {
  if (action) {
    return state + 1
  }
  else{
    return state -1
  }
}

export const NotificationComponent = ({ notificationField, notificationUpdateAtField }) => {
  const [notification, setNotification] = useState({})
  const [showNotification, setShowNotification] = useState(false)

  const mounted = async () => {
    const version = await getVersion()
    if (version !== VERSION) {
      // Hard refresh!
      window.location.href = window.location.href
    }
    const ignorePaths = [
      "/onboard",
      "/login",
      "/reset-password-request",
      "/reset-password",
      "/register",
      "/client/register",
      "/talent/register",
      "/message"
    ]
    const ignore = ignorePaths.find(path => window.location.pathname.startsWith(path))
    if (ignore) { return }
    let n = await getNotification()
    n = n || {}
    setNotification(n)
    setShowNotification(n[notificationField] && `${n[notificationUpdateAtField]}` !== window.localStorage.getItem('n_updated_at'))
  }

  useEffect(() => {
    mounted()
  }, [])

  return (
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
        <div className="notification-content" dangerouslySetInnerHTML={{__html: notification[notificationField]}} />
        <div className="mt-2">
          <button className="btn btn-primary" onClick={() => {
            window.localStorage.setItem('n_updated_at', notification[notificationUpdateAtField])
            setShowNotification(false)
          }}>
            Ok, Got it.
          </button>
        </div>
      </Modal.Body>
    </Modal>
  )
}

function App() {
  const [logo, setLogo] = useState('')
  const [email, setEmail] = useState({})
  const [title, setTitle] = useState('')
  const [showLoadingSemaphor, dispatch] = useReducer(reducer, state)

  useEffect(() => {
    if (window.location.pathname.indexOf('/onboard') !== -1) {
      window.localStorage.setItem('prev_url', window.location.href)
      return
    }
    if (window.location.pathname.indexOf('/message') !== -1) {
      return
    }
    verityToken().then(async (email) => {
      setEmail(email)
      window.localStorage.setItem('email', email)
      if (window.location.pathname === '/login') {
        const pUrl = window.localStorage.getItem('prev_url') || '/'
        window.localStorage.removeItem('prev_url')
        window.location.href = pUrl
        return
      }
      const user = getUser()
      if (user.logo) {
        setLogo(user.logo)
      }
      let chatScriptDom = document.createElement('script')
      chatScriptDom.src = '//fast.cometondemand.net/54561x_x782c3x_xcorex_xembedcode.js?v=7.48.6.1'
      document.body.appendChild(chatScriptDom)
    }, () => {
      if (window.location.pathname !== '/login') {
        if ([
          '/reset-password-request',
          '/reset-password',
          '/register',
          '/client/register',
          '/talent/register'
        ].includes(window.location.pathname)) {
          return
        }
        window.localStorage.setItem('prev_url', window.location.href)
        window.localStorage.removeItem('email')
        window.location.href = '/login'
      }
    })
  }, [])

  useEffect(() => {
    if (showLoadingSemaphor > 0) {
      document.querySelector('.loading').classList.add('show')
    } else {
      document.querySelector('.loading').classList.remove('show')
    }
  }, [showLoadingSemaphor])
  
  const recaptchaKey = process.env.REACT_APP_RECAPTCHA_KEY
  const user = getUser() || {}

  const HP = user.user_type === USER_TYPES.CLIENT ? ClientCheckinPage : CheckinPage
  const toggleLoadingState = (state) => {
    dispatch(state)
  }
  
  return (
    <GoogleReCaptchaProvider reCaptchaKey={recaptchaKey}>
      <Provider store={store}>
        <ShowLoadingContext.Provider value={toggleLoadingState}>
          <IconContext.Provider value={{ className: "global-class-name" }}>
            <div className={`loading`}>
              <button className='btn btn-secondary btn-sm' onClick={() => {
                const event = new Event('soft-refresh')
                document.body.dispatchEvent(event)
                document.querySelector('.loading').classList.remove('show')
              }}>
                Processing... <small>(click to refresh)</small>
              </button>
            </div>
            
            <AuthContext.Provider value={user}>
              <TitleContext.Provider value={{title, setTitle}}>
                <Router>
                  <Header logo={logo} />
                  <Switch>
                    <Route path="/login" component={(props) => <Login {...props} />} exact />
                    <Route path="/reset-password-request" component={(props) => <ResetPasswordRequest {...props} />} exact />
                    <Route path="/reset-password" component={(props) => <ResetPassword {...props} />} exact />
                    <Route path="/register" component={(props) => <Register {...props} />} exact />
                    <Route path="/client/register" component={(props) => <ClientRegister {...props} />} exact />
                    <Route path="/talent/register" component={(props) => <TalentRegister {...props} />} exact />
                    <PrivateRoute
                      path="/heyjoe-admin"
                      component={AdminView}
                      accessTypes={[USER_TYPES.SUPER_ADMIN]}
                    />
                    <Route path="/message/:record_id" component={RecordMessagePage} />
                    <Route path="/studio/:uri/:session_id" component={HP} />
                    <PrivateRoute
                      path="/studios/:studio_uri/sessions/:session_id/find-freelancer"
                      component={FindFreelancer}
                      accessTypes={[USER_TYPES.SESSION_MANAGER, USER_TYPES.SUPER_ADMIN]}
                    />
                    <Route path="/onboard/:uri/:session_id" component={Onboard} />
                    {!(user.user_type === USER_TYPES.CLIENT) &&
                      <Route path="/video/:uri/:session_id" component={props => <VideoPage setLogo={setLogo} {...props} />} />
                    }
                    <PrivateRoute
                      path="/freelancer-profile"
                      component={props => <FreelancerProfilePage {...props} />}
                      accessTypes={[USER_TYPES.SESSION_MANAGER, USER_TYPES.SUPER_ADMIN]}
                    />
                    <PrivateRoute
                      path="/freelancer-requests/:id"
                      component={ProjectInvite}
                      accessTypes={[USER_TYPES.SUPER_ADMIN, USER_TYPES.SESSION_MANAGER]}
                    />
                    <Route path="/posting-page/:uri/:postingpage_id" component={props => <PostingPage setLogo={setLogo} {...props} />} />
                    <Route path="/" component={HomeBomponent} exact />
                    <Route path="*" component={Error404} />
                  </Switch>
                </Router>
              </TitleContext.Provider>
            </AuthContext.Provider>
            
            { user && user.user_type !== USER_TYPES.CLIENT && (
              <NotificationComponent
                notificationField="notification"
                notificationUpdateAtField="notification_updated_at"
              />
            )}
          </IconContext.Provider>
        </ShowLoadingContext.Provider>
      </Provider>
      <input type="text" style={{ display: 'none' }} id="urlInput" />
    </GoogleReCaptchaProvider>
  );
}

const HomeBomponent = (props) => {
  const user = getUser()
  if (!user) {
    return null
  }
  switch (user.user_type) {
    case USER_TYPES.CLIENT:
      return <ClientHomePage />
    case USER_TYPES.SESSION_MANAGER:
      return <SessionManagerPage {...props} />
    case USER_TYPES.TALENT:
      return <TalentPage {...props} />
    default:
      return <StudioList {...props} />
  }
}

export default App;
