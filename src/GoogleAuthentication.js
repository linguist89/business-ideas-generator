import './Buttons.css';
import './GoogleAuthentication.css';
import React, { useEffect, useContext } from "react";
import { auth, googleProvider } from "./Firebase.js";
import { getRedirectResult, signInWithPopup } from "firebase/auth";
import { UserContext } from './App';
import GoogleLogo from './static/images/g-logo_transparent.png';

function GoogleAuthentication() {
  const { user, setUser } = useContext(UserContext);

  useEffect(() => {
    const fetchRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        setUser(result.user);
      } catch (error) {
        console.log(error.message);
      }
    }
    
    fetchRedirectResult();
  }, [setUser]); 

  return (
    <div>
      { !user &&
        <button className="transparent-purple-button google-button" onClick={() => signInWithPopup(auth, googleProvider)}>
          <img src={GoogleLogo} alt="Google Logo" className="google-logo" />
          Sign in with Google
        </button>
      }
    </div>
  );
};

export default GoogleAuthentication;
