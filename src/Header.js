import React, { useState, useEffect } from 'react';
import './Header.css';
import { UserContext } from './App';
import { auth } from './Firebase.js';
import { signOut, onAuthStateChanged } from "firebase/auth";
import HeaderImage from './static/images/site_logo.png';
import LoginDialog from './LoginDialog.js';
import { db } from './Firebase.js';
import { doc, increment, setDoc, getDoc } from 'firebase/firestore';

function Header() {
  const { user, setUser } = React.useContext(UserContext);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [credits, setCredits] = useState(0);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userCreditsRef = doc(db, 'users', currentUser.uid, 'credits', 'total');
        getDoc(userCreditsRef).then((docSnap) => {
          if (docSnap.exists()) {
            setCredits(docSnap.data().amount);
          } else {
            setDoc(userCreditsRef, { amount: 100 }, { merge: true });
            setCredits(100);
          }
        });
      }
    });

    return () => unsubscribe();
  }, [setUser]);

  async function addCredits() {
    try {
      const userCreditsRef = doc(db, 'users', user.uid, 'credits', 'total');
      await setDoc(userCreditsRef, { amount: increment(500) }, { merge: true });
      setCredits(credits + 500);
      console.log("Credits successfully updated!");
      alert(`You've successfully purchased ${500} credits`);
    } catch (error) {
      console.error("Error updating credits: ", error);
      alert(`There has been an error with your purchase`);
    }
  }

  return (
    <header className="header">
      <div className="header-wrapper">
        <div className="logo">
          <img src={HeaderImage} alt="Business Ideas logo" />
        </div>
        {user && <div className="welcome-div">Welcome, {user.displayName ? `${user.displayName} (${credits} credits)` : `${user.email} (${credits} credits)`}</div>}
        <div className="HeaderButtonsWrapper">
          {
            user
              ? <>
                <button className="transparent-button" onClick={addCredits}>Buy Credits</button>
                <button className="transparent-button" onClick={() => signOut(auth)}>Logout</button>
              </>
              : <button className="transparent-button" onClick={() => setShowLoginDialog(true)}>Login</button>
          }
          <LoginDialog open={showLoginDialog} onClose={() => setShowLoginDialog(false)} />
        </div>
      </div>
    </header>
  );
};

export default Header;
