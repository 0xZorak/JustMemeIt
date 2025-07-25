import React, { useState } from 'react';
import Modal from '../components/Modal';
import '../styles/vote.css';

const Vote = () => {
  const [isHowToPlayModalOpen, setHowToPlayModalOpen] = useState(false);
  const [isLoginModalOpen, setLoginModalOpen] = useState(false);

  const toggleHowToPlayModal = () => setHowToPlayModalOpen((open) => !open);
  const toggleLoginModal = () => setLoginModalOpen((open) => !open);

  return (
    <div className="vote-content" style={{ width: '100%', height: '100%' }}>
      {/* You can add your voting UI here */}
      <div className="vote-placeholder" style={{ margin: 'auto', textAlign: 'center' }}>
        <h2>Vote for your favorite meme!</h2>
        <button className="how-to-play-btn" onClick={toggleHowToPlayModal}>How to play &gt;</button>
        <button className="login-btn" onClick={toggleLoginModal}>Login</button>
      </div>
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
      >
        <p>New here? We'll help you create an account in no time!</p>
        <div className="login-options">
          <button className="wallet-btn">Wallet</button>
          <button className="twitter-btn">Twitter</button>
        </div>
      </Modal>
    </div>
  );
};

export default Vote;