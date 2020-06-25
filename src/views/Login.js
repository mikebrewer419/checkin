import React, { useState, useEffect } from 'react'

const Login = ({ onSubmit, error }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    document.title = `Check In | Login`;
  }, [])
  return (
    <div className="d-flex align-items-center justify-content-center vh-100">
      <div>
        <h1> Login </h1>
        <div className="form-group">
          <label htmlFor="exampleInputEmail1">Email address</label>
          <input
            type="email"
            className="form-control"
            id="exampleInputEmail1"
            aria-describedby="emailHelp"
            value={email}
            onChange={ev => setEmail(ev.target.value)}
          />
          <small id="emailHelp" className="form-text text-muted">We'll never share your email with anyone else.</small>
        </div>
        <div className="form-group">
          <label htmlFor="exampleInputPassword1">Password</label>
          <input
            type="password"
            className="form-control"
            id="exampleInputPassword1"
            value={password}
            onChange={ev => setPassword(ev.target.value)}
          />
        </div>
        <p className="text-danger">{`${error || ''}`}</p>
        <button
          type="submit"
          className="btn btn-primary"
          onClick={() => onSubmit(email, password)}
        >Submit</button>
      </div>
    </div>
  )
}

export default Login
