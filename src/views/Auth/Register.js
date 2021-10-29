import React from "react";
import { withRouter } from 'react-router-dom'

const Register = ({ history }) => {
  const handleRegister = (type) => {
    switch (type) {
      case 'client':
        history.push('/client/register')
        break
      case 'talent':
        history.push('/talent/register')
        break
      case 'casting-director':
        window.open('https://heyjoe.io/contact-us/')
        break
    }
  }
  return (
    <div className="d-flex align-items-center flex-column login-page">
      <div className="bg-danger vw-100 p-3 d-flex justify-content-center header">
        <img
          src={require("../../assets/heyjoe.png")}
          className="heyjoe-logo white"
        />
      </div>
      <div className="register-pane text-primary login-form-wrapper bg-lightgray d-flex flex-column px-5 justify-content-center">
        <h2 className=" text-center mb-4"> Tell us what type of account<br/> you need?</h2>
        <div className="w-100 user-type-item" onClick={() => { handleRegister('client') }}>
          <label className="h1 mr-2">Client</label>
          <span>to view casting sessions</span>
        </div>
        <div className="w-100 user-type-item" onClick={() => { handleRegister('talent') }}>
          <label className="h1 mr-2">Talent</label>
          <span>to audition on our platform</span>
        </div>
        <div className="w-100 user-type-item" onClick={() => { handleRegister('casting-director') }}>
          <label className="h1 mr-2">Casting Professional</label>
          <br />
          <span>Please Contact Us to set up your account</span>
        </div>
      </div>
    </div>
  );
};

export default withRouter(Register);
