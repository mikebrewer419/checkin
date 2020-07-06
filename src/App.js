import React, { useEffect, useState } from 'react'
import { Switch, Route, BrowserRouter as Router } from 'react-router-dom'
import './App.css'
import { loginApi, verityToken } from './api'
import Login from './views/Login'
import HomePage from './views/HomePage'
import Onboard from './views/Onboard'
import VideoPage from './views/Video'
import StudioList from './views/studio/list'
import 'bootstrap/dist/css/bootstrap.min.css'

function App() {
  const [error, setError] = useState('')

  useEffect(() => {
    if (window.location.pathname.indexOf('/onboard') !== -1) {
      return
    }
    verityToken().then((email) => {
      window.localStorage.setItem('email', email)
      if (window.location.pathname === '/login') {
        const pUrl = window.localStorage.getItem('prev_url') || '/'
        window.localStorage.removeItem('prev_url')
        window.location.href = pUrl
      }
      let chatScriptDom = document.createElement('script')
      chatScriptDom.src = '//fast.cometondemand.net/54561x_x782c3x_xcorex_xembedcode.js?v=7.48.6.1'
      document.body.appendChild(chatScriptDom)
    }, () => {
      window.localStorage.setItem('prev_url', window.location.href)
      window.localStorage.removeItem('email')
      if (window.location.pathname !== '/login') {
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
        }
      }, (error) => {
        setError(error)
      })
  }

  return (
    <Router>
      <Switch>
        <Route path="/login" component={() => <Login
          onSubmit={doLogin}
          error={error}
        />} exact />
        <Route path="/studio/:uri/:meeting_id" component={HomePage} />
        <Route path="/onboard/:uri/:meeting_id" component={Onboard} />
        <Route path="/video/:uri/:meeting_id" component={VideoPage} />
        <Route path="/" component={StudioList} />
      </Switch>
    </Router>
  );
}

export default App;
