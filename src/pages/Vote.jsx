import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import '../styles/vote.css';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';

const Vote = () => {
  const [isHowToPlayModalOpen, setHowToPlayModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);
  const [xUser, setXUser] = useState(null);

  // wagmi hook for wallet info
  const { address, isConnected } = useAccount();

  // Check for X login success on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const name = params.get('name');
    const profile_image_url = params.get('profile_image_url');
    if (name && profile_image_url) {
      setXUser({ name, profile_image_url });
      window.history.replaceState({}, document.title, window.location.pathname); // Clean up URL
    }
  }, []);

  const toggleHowToPlayModal = () => setHowToPlayModalOpen((open) => !open);
  const toggleLoginModal = () => setLoginModalOpen((open) => !open);

  // Real X login: redirect to backend
  const handleXLogin = () => {
    window.location.href = 'http://localhost:4000/auth/x/login';
  };

  return (
    <div className="vote-content" style={{ width: '100%', height: '100%' }}>
      {/* Header Bar */}
      <div className="vote-header">
        <span>Just meme it</span>
        <div className="vote-header-bar">
          {/* How to Play button */}
          <button
            className="how-to-play-btn"
            onClick={toggleHowToPlayModal}
          >
            How to Play
          </button>
          {/* Header logic */}
          {isConnected && !xUser && (
            <>
              <ConnectButton />
              <button
                className="login-btn"
                onClick={toggleLoginModal}
              >
                Login your X
              </button>
            </>
          )}
          {xUser && !isConnected && (
            <>
              <img
                src={xUser.profile_image_url}
                alt="X Profile"
                className="x-profile-img"
                onClick={toggleLoginModal}
              />
              <button
                className="login-btn wallet"
                onClick={toggleLoginModal}
              >
                Connect your wallet
              </button>
            </>
          )}
          {xUser && isConnected && (
            <>
              <ConnectButton />
              <img
                src={xUser.profile_image_url}
                alt="X Profile"
                className="x-profile-img"
                onClick={toggleLoginModal}
              />
            </>
          )}
          {!xUser && !isConnected && (
            <button
              className="login-btn"
              onClick={toggleLoginModal}
            >
              Login
            </button>
          )}
        </div>
      </div>
      {/* Main content can go here */}
      <Modal 
        isOpen={isHowToPlayModalOpen} 
        onClose={toggleHowToPlayModal} 
        title="How to Play"
      >
        <p>1. Spot a Meme You Love on X</p>
        <p className="sub-text">See a funny or viral meme posted by Elon Musk or anyone else?</p>
        <p className="sub-text">Reply under the tweet with: &gt; @justmemeit_ meme it</p>
        <p>2. Collect Memes During the Day</p>
        <p className="sub-text">Every meme you “meme’d” gets added to your private dashboard.</p>
        <p className="sub-text">At the end of the day, you’ll have a collection of your favorite memes.</p>
        <p>3. Pick Your Best Meme for the Weekly Battle</p>
        <p className="sub-text">Once a week, choose one meme from your gallery to enter into the Meme Voting Arena.</p>
        <p className="sub-text">You only get one entry — make it count.</p>
        <p>4. Let the Battles Begin (Vote with SEI)</p>
        <p className="sub-text">All users can browse submitted memes and vote for their favorites using $SEI tokens.</p>
        <p className="sub-text">1 $SEI = 1 vote.</p>
        <p className="sub-text">You can vote on as many memes as you like — once per meme.</p>
        <p>5. Top Meme Becomes an NFT</p>
        <p className="sub-text">When the voting ends:</p>
        <p className="sub-text">The winning meme is minted as an NFT.</p>
        <p className="sub-text">The creator receives the NFT plus 40% of all voting fees.</p>
        <p className="sub-text">All voters for that meme receive a reward NFT drop.</p>
      </Modal>
      <Modal 
        isOpen={isLoginModalOpen} 
        onClose={toggleLoginModal} 
        title="Log in / Sign Up"
        showOK={false}
      >
        <p>New here? We'll help you create an account in no time!</p>
        <div className="login-options">
          {/* Wallet connect handled by RainbowKit */}
          <ConnectButton />
          <button className="twitter-btn" onClick={handleXLogin}>X (Twitter)</button>
        </div>
        {/* Show wallet address if connected */}
        {/* {isConnected && (
          <div style={{ marginTop: 12, color: '#2563eb', fontWeight: 500 }}>
            Wallet: {address}
          </div>
        )} */}
      </Modal>
    </div>
  );
};

export default Vote;