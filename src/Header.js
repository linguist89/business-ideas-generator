import React, { useState, useEffect } from 'react';
import './Header.css';
import { UserContext, CreditContext } from './App';
import HeaderImage from './static/images/site_logo.png';
import LoginDialog from './LoginDialog.js';
import PricingDialog from './PricingDialog';
import ProfileDialog from './ProfileDialog';
import useUserSubscription from './useUserSubscription';

function Header() {
  const { user, setUser } = React.useContext(UserContext);
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const { credits, setCredits } = React.useContext(CreditContext);
  const { userPlan, userPlanActivity, renewalDate } = useUserSubscription(setUser, setCredits);

  return (
    <header className="header">
      <div className="header-wrapper">
        <div className="logo">
          <img src={HeaderImage} alt="Business Ideas logo" />
        </div>
        {user &&
          <div className="welcome-div">
            {<>
              <p>{`Welcome, ${user.displayName ? user.displayName : user.email}`}</p>
              <p>{`You have ${credits} credits remaining`}</p>
            </>

            }
          </div>
        }
        <div className="HeaderButtonsWrapper">
          {
            user
              ? <>
                <PricingDialog purchaseTypeFilter="recurring" title="Subscriptions"></PricingDialog>
                <PricingDialog purchaseTypeFilter="one_time" title="Buy Credits"></PricingDialog>
                <ProfileDialog></ProfileDialog>
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
