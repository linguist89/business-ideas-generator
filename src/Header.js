import React, { useState } from 'react';
import './Header.css';
import { UserContext } from './App';
import { auth } from './Firebase.js';
import { signOut, onAuthStateChanged } from "firebase/auth";
import HeaderImage from './static/images/site_logo.png';
import LoginDialog from './LoginDialog.js';

function Header() {
  const { user, setUser } = React.useContext(UserContext);
  const [showLoginDialog, setShowLoginDialog] = useState(false);

  React.useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, [setUser]);

  return (
    <header className="header">
      <div className="header-wrapper">
        <div className="logo">
          <img src={HeaderImage} alt="Business Ideas logo" />
        </div>
        {
          user ?
            <>
              <div className="welcome-div">Welcome, {user.displayName ? user.displayName : user.email}</div>
              <button className="transparent-button" onClick={() => signOut(auth)}>Logout</button>
            </> :
            <button className="transparent-button" onClick={() => setShowLoginDialog(true)}>Login</button>
        }
        <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
      </div>
    </header>
  );
};

export default Header;
