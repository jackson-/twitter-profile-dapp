import type { NextPage } from 'next'
import Head from 'next/head'
import Image from 'next/image'
import { useState, useEffect } from "react";

import { getAuth, TwitterAuthProvider, signInWithPopup } from "firebase/auth";

import { initializeApp } from "firebase/app";


const provider = new TwitterAuthProvider();
const firebaseConfig = {
  apiKey: process.env.apiKey,
  authDomain: process.env.authDomain,
  projectId: process.env.projectId,
  storageBucket: process.env.storageBucket,
  messagingSenderId: process.env.messagingSenderId,
  appId: process.env.appId
};
// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const auth = getAuth(firebaseApp)

const Home: NextPage = () => {
  const [currentAccount, setCurrentAccount] = useState('');
  const [currentUser, setCurrentUser] = useState<any | null>(null);

  const connectTwitter = async () => {
      const provider = new TwitterAuthProvider();
      
      signInWithPopup(auth, provider)
      .then((re) => {
        const updatedUser = {name: re.user.displayName, image: re.user.photoURL, prevState: currentUser}
        setCurrentUser(updatedUser);
      }).catch((err) => {
        console.log("ERR ", err);
      })
  }

  const connectWallet = async () => {
    try {
      const { ethereum } = window;
      {/* May want to account for browsers that have wallets built in like Brave */}
      if (!ethereum) {
        alert("Get MetaMask -> https://metamask.io/");
        return;
      }
			
      const accounts = await ethereum.request({ method: "eth_requestAccounts" });
      
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error)
    }
  }

  const checkIfWalletIsConnected = async () => {
		const { ethereum } = window;

		if (!ethereum) {
			console.log('Make sure you have metamask!');
			return;
		} else {
			console.log('We have the ethereum object', ethereum);
		}

		const accounts = await ethereum.request({ method: 'eth_accounts' });

		if (accounts.length !== 0) {
			const account = accounts[0];
			setCurrentAccount(account);
		} else {
			console.log('No authorized account found');
		}
	};

  // Render methods
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
			<button onClick={connectWallet} className="cta-button connect-wallet-button">
				Connect Wallet
			</button>
		</div>
	);

  const renderTwitterSignup = () => {
    return (
      <div className="twitter-container">
        <button onClick={connectTwitter}>Sign in with Twitter</button>
      </div>
    );
  }

  const renderTwitterInfo = () => {
    return (
      <div className="twitter-container">
       <h1>Welcome back {currentUser.name}</h1>
       <img src={currentUser.image} />
      </div>
    );
  }

  useEffect(() => {
		checkIfWalletIsConnected();
	}, []);
  return (
    <div className="App">
			<div className="container">
				{!currentAccount && renderNotConnectedContainer()}
				{/* Render the input form if an account is connected */}
				{currentAccount && !currentUser && renderTwitterSignup()}
        {currentAccount && currentUser && renderTwitterInfo()}
			</div>
		</div>
  )
}

export default Home
