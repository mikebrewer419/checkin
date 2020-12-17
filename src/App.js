import React, { useEffect, useState } from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { IconContext } from "react-icons";
import { GoogleReCaptchaProvider } from 'react-google-recaptcha-v3'
import { verityToken, getUser, super_admins } from './services'
import Login from './views/Auth/Login'
import ResetPasswordRequest from './views/Auth/ResetPasswordRequest'
import Resetpassword from './views/Auth/Resetpassword'
import Register from './views/Auth/Register'
import HomePage from './views/HomePage'
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

  useEffect(() => {
    if (window.location.pathname.indexOf('/onboard') !== -1) {
      return
    }
    if (window.location.pathname.indexOf('/message') !== -1) {
      return
    }
    verityToken().then((email) => {
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
            <Route path="/reset-password" component={() => <Resetpassword />} exact />
            <Route path="/register" component={() => <Register />} exact />
            {super_admins.includes(email) &&
              <Route path="/heyjoe-admin" component={AdminView} />
            }
            <Route path="/message/:record_id" component={RecordMessagePage} />
            <Route path="/studio/:uri/:session_id" component={HomePage} />
            <Route path="/onboard/:uri/:session_id" component={Onboard} />
            <Route path="/video/:uri/:session_id" component={props => <VideoPage setLogo={setLogo} {...props} />} />
            <Route path="/posting-page/:uri/:postingpage_id" component={props => <PostingPage setLogo={setLogo} {...props} />} />
            <Route path="/" component={HomeBomponent} />
          </Switch>
        </Router>
      </IconContext.Provider>
    </GoogleReCaptchaProvider>
  );
}

const HomeBomponent = (props) => {
  const user = getUser()
  if (!user) {
    return null
  }
  if (user.user_type === USER_TYPES.SESSION_MANAGER) {
    return <SessionList {...props} />
  } else {
    return <StudioList {...props} />
  }
}

export default App;
