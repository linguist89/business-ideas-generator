// PasswordSignupAuthentication.js
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth } from "./Firebase.js";
import './PasswordSignupAuthentication.css'
import './Buttons.css';

function PasswordSignupAuthentication() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleInputChange = (event, setter) => {
    setter(event.target.value);
  }

  const handleSignup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      setError(error.message);
    }
  }

  return (
    <div className="authentication-form">
      <input
        type="email"
        value={email}
        onChange={(event) => handleInputChange(event, setEmail)}
        placeholder="Email"
      />
      <input
        type="password"
        value={password}
        onChange={(event) => handleInputChange(event, setPassword)}
        placeholder="Password"
      />
      <button className="transparent-button" onClick={handleSignup}>Signup</button>
      {error && <p>{error}</p>}
    </div>
  )
}

export default PasswordSignupAuthentication;
