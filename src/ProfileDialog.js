import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import './ProfileDialog.css';
import { signOut } from "firebase/auth";
import { UserContext, CreditContext } from './App';
import { auth } from './Firebase.js';
import useUserSubscription from './useUserSubscription';

function ProfileDialog({ open, onClose }) {
    const { user, setUser } = React.useContext(UserContext);
    const { credits, setCredits } = React.useContext(CreditContext);
    const { userPlan, userPlanActivity, renewalDate } = useUserSubscription(setUser, setCredits);

    React.useEffect(() => {
        if (!user) {
            onClose(false);
        }
    }, [user, onClose]);

    return (
        <Dialog.Root open={open} onOpenChange={onClose}>
            <Dialog.Trigger asChild>
                <button className="transparent-button">Profile</button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="ProfileDialogOverlay" />
                <Dialog.Content className="ProfileDialogContent">
                    <h1 className="profile-heading">Profile</h1>
                    {user &&
                        <div>
                            {<>
                                <p>{`${user.displayName ? user.displayName : user.email} (${credits} credits remaining)`}</p>
                                <p>{`${userPlan} renewal date: ${renewalDate}`}</p>
                            </>

                            }
                        </div>
                    }
                    <div className="profile-information">
                        <button className="solid-card-button" onClick={() => signOut(auth)}>Logout</button>
                    </div>
                    <Dialog.Close asChild>
                        <button className="IconButton" aria-label="Close">
                            <Cross2Icon />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    );
}

export default ProfileDialog;
