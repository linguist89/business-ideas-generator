import React from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { Cross2Icon } from '@radix-ui/react-icons';
import './Buttons.css';
import './PricingDialog.css';
import { db } from './Firebase.js';
import { collection, query, where, getDocs, doc } from 'firebase/firestore';
//https://github.com/stripe/stripe-firebase-extensions/blob/next/firestore-stripe-web-sdk/README.md
//https://www.youtube.com/watch?v=HW5roUF2RLg

export default function PricingDialog() {
    const [plans, setPlans] = React.useState([]);

    React.useEffect(() => {
        const fetchProducts = async () => {
            const productsQuery = query(collection(db, 'products'), where('active', '==', true));
            const querySnapshot = await getDocs(productsQuery);
            for (const docSnapshot of querySnapshot.docs) {

                const priceSnap = await getDocs(collection(doc(db, 'products', docSnapshot.id), 'prices'));
                if (!priceSnap.empty) {
                    const priceDoc = priceSnap.docs[0]; // take the first price document
                    console.log(docSnapshot.data().name);
                    console.log(priceDoc.data().unit_amount);
                    let productDict = { 'title': docSnapshot.data().name, 'price': priceDoc.data().unit_amount / 100, 'features': ['Test', 'Test'] };
                    setPlans(plans => [...plans, productDict]);
                }
            }
        };

        fetchProducts();
    }, []);

    return (
        <Dialog.Root>
            <Dialog.Trigger asChild>
                <button className="transparent-button">Subcriptions</button>
            </Dialog.Trigger>
            <Dialog.Portal>
                <Dialog.Overlay className="PricingDialogOverlay" />
                <Dialog.Content className="PricingDialogContent">
                    <Dialog.Title className="PricingDialogTitle">Pricing Plans</Dialog.Title>
                    <div className="PricingTable">
                        {plans && plans.map((plan, index) => (
                            <div className="PricingPlan" key={index}>
                                <h2 className="PlanTitle">{plan.title}</h2>
                                <p className="PlanPrice">{plan.price}</p>
                                <ul className="PlanFeatures">
                                    {plan.features.map((feature, index) => (
                                        <li className="FeatureItem" key={index}>{feature}</li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    <div style={{ display: 'flex', marginTop: 25, justifyContent: 'flex-end' }}>
                        <Dialog.Close asChild>
                            <button className="solid-card-button">Close</button>
                        </Dialog.Close>
                    </div>
                    <Dialog.Close asChild>
                        <button className="IconButton" aria-label="Close">
                            <Cross2Icon />
                        </button>
                    </Dialog.Close>
                </Dialog.Content>
            </Dialog.Portal>
        </Dialog.Root>
    )
}
