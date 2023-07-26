import React, { useState, useEffect } from 'react';
import './Header.css';
import { UserContext, CreditContext } from './App';
import { auth, db } from './Firebase.js';
import { signOut, onAuthStateChanged } from "firebase/auth";
import HeaderImage from './static/images/site_logo.png';
import LoginDialog from './LoginDialog.js';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import PricingDialog from './PricingDialog';
import BuyCreditsDialog from './BuyCreditsDialog';

function Header() {
  const { user, setUser } = React.useContext(UserContext);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { credits, setCredits } = React.useContext(CreditContext);
  const plans = [
    { title: 'Free Plan', price: 'Free', features: ['100 credits once off'] },
    { title: 'Basic Plan', price: '$20/mo', features: ['500 credits per month'] },
    { title: 'Pro Plan', price: '$30/mo', features: ['1000 credits per month'] },
  ];

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        const userCreditsRef = doc(db, 'customers', currentUser.uid, 'credits', 'total');
        getDoc(userCreditsRef).then((docSnap) => {
          if (docSnap.exists()) {
            let creditAmount = docSnap.data().amount;
            creditAmount = creditAmount < 0 ? 0 : creditAmount;
            setCredits(creditAmount);
          } else {
            setDoc(userCreditsRef, { amount: 100 }, { merge: true });
            setCredits(100);
          }
        });
      }
    });

    return () => unsubscribe();
  }, [setUser]);

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
                <PricingDialog plans={plans} />
                <BuyCreditsDialog></BuyCreditsDialog>
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
