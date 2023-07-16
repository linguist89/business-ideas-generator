import React, { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import './LoginDialog.css';
import './Buttons.css';
import GoogleAuthentication from './GoogleAuthentication';
import LoginWithEmailLink from './PasswordlessLogin';
import PasswordSignupAuthentication from './PasswordSignupAuthentication';
import PasswordLoginAuthentication from './PasswordLoginAuthentication';
import OrLine from './OrLine';

function LoginDialog() {
    const [showSignup, setShowSignup] = useState(false);

    return (
  <Dialog.Root>
    <Dialog.Trigger asChild>
      <button className="transparent-button">Login</button>
    </Dialog.Trigger>
    <Dialog.Portal>
      <Dialog.Overlay className="LoginDialogOverlay"/>
      <Dialog.Content className="LoginDialogContent">
        {!showSignup && <h1 className="login-heading">Login</h1>}
        {showSignup && <h1 className="login-heading">Sign Up</h1>}
        <div className="social-logins">
          {!showSignup && <><PasswordLoginAuthentication></PasswordLoginAuthentication>
          <OrLine></OrLine>
          <GoogleAuthentication></GoogleAuthentication>
          <LoginWithEmailLink></LoginWithEmailLink></>}
          {showSignup ?
            <PasswordSignupAuthentication></PasswordSignupAuthentication> 
            : 
            <p>
              Don't have an account? 
              {' '}
              <button className="link-button" onClick={() => setShowSignup(true)}>Signup here</button>
            </p>}
          {showSignup &&
            <p>
              Already have an account? 
              {' '}
              <button className="link-button" onClick={() => setShowSignup(false)}>Login instead</button>
            </p>}
        </div>        
        <Dialog.Close asChild>
          <button className="IconButton" aria-label="Close">
            <Cross2Icon />
          </button>
        </Dialog.Close>
      </Dialog.Content>
    </Dialog.Portal>
  </Dialog.Root>
)};

export default LoginDialog;
