import React, { useEffect, useState } from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import { IconContext } from "react-icons";
import './App.scss'
import { loginApi, verityToken, getUser } from './services'
import Login from './views/Auth/Login'
import HomePage from './views/HomePage'
import RecordMessagePage from './views/RecordMessagePage'
import Onboard from './views/Onboard'
import VideoPage from './views/VideoReview'
import StudioList from './views/studio/list'
import SessionList from './views/Sessions'
import Header from './components/Header'
import Footer from './components/Footer'
import { USER_TYPES } from './constants';

function App() {
  const [error, setError] = useState('')

  useEffect(() => {
    if (window.location.pathname.indexOf('/onboard') !== -1) {
      return
    }
    if (window.location.pathname.indexOf('/message') !== -1) {
      return
    }
    verityToken().then((email) => {
      window.localStorage.setItem('email', email)
      if (window.location.pathname === '/login') {
        const pUrl = window.localStorage.getItem('prev_url') || '/'
        window.localStorage.removeItem('prev_url')
        window.location.href = pUrl
        return
      }
      let chatScriptDom = document.createElement('script')
      chatScriptDom.src = '//fast.cometondemand.net/54561x_x782c3x_xcorex_xembedcode.js?v=7.48.6.1'
      document.body.appendChild(chatScriptDom)
    }, () => {
      if (window.location.pathname !== '/login') {
        window.localStorage.setItem('prev_url', window.location.href)
        window.localStorage.removeItem('email')
        window.location.href = '/login'
      }
    })
  }, [])

  const doLogin = (email, password) => {
    loginApi(email, password)
      .then(() => {
        const pUrl = window.localStorage.getItem('prev_url')
        if (pUrl) {
          window.localStorage.removeItem('prev_url')
          window.location.href = pUrl
        } else {
          window.location.href = '/'
        }
      }, (error) => {
        setError(error)
      })
  }

  return (
    <IconContext.Provider value={{ className: "global-class-name" }}>
      <div className={`loading`}>
        Processing...
      </div>
      <Router>
        <Header />
        <Switch>
          <Route path="/login" component={() => <Login
            onSubmit={doLogin}
            error={error}
          />} exact />
          <Route path="/message/:record_id" component={RecordMessagePage} />
          <Route path="/studio/:uri/:session_id" component={HomePage} />
          <Route path="/onboard/:uri/:session_id" component={Onboard} />
          <Route path="/video/:uri/:session_id" component={VideoPage} />
          <Route path="/" component={HomeBomponent} />
        </Switch>
        <Footer />
      </Router>
    </IconContext.Provider>
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
