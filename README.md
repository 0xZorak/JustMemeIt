JustMemeIt

JustMemeIt is a social, gamified Web3 platform that brings meme culture to the SEI blockchain.
Instantly collect, edit, and compete with memes from X, vote with $SEI tokens and win onchain rewards. 
Onboard new users to SEI through fun, creative, and viral meme battles.

How It Works

1. Spot & Meme It  
Whenever you see a meme you like on X, simply tag "@justmemeit_" and add "meme it" to your reply.  
Our bot automatically detects your mention, fetches the meme image, and pushes it to your profile on the JustMemeIt website.

2. Edit Your Meme  
After the meme lands on your profile, visit our website to edit the caption and make it your own.  
You can collect as many memes as you want, but you’ll have to choose wisely for the next step.

3. Enter the Voting Arena  
Once every week, you can upload one meme from your profile into the Voting Arena.  
All users can vote on memes using $SEI tokens. There’s no limit vote for as many memes as you like.

4. Winning & Rewards  
At the end of the week, the meme with the most votes is announced as the Winning Meme on our Updates Page.

Rewards:
- The meme creator receives the winning meme as an NFT + 40% of all voting fees for the week.
- All voters for the winning meme receive an NFT version of the meme directly in their wallets.
- Winning memes are also made available for sale on Magic Eden.

5. MemeAI Generator  
Convert your personal images into SEI meme art styles using our MemeAI Generator and mint them as NFTs on SEI blockchain.  
Current SEI art styles include: $FROGGY, $SEIYAN, $POPO.

 Features

- Twitter Bot Integration: Seamlessly collect memes from X by tagging @justmemeit_ + "meme it".
- Profile Dashboard: View and edit your collected memes.
- Weekly Meme Battles: Enter your best meme into the arena and compete for votes.
- Onchain Voting: Vote for memes using $SEI tokens; 1 $SEI = 1 vote.
- NFT Minting: Winning memes are minted as NFTs on SEI.
- MemeAI Generator: Transform your own images into SEI-styled meme art and mint as NFTs.
- Magic Eden Integration: Winning NFTs are listed for sale on Magic Eden.
- Gamified Onboarding: Users naturally set up wallets, use SEI tokens, and explore NFTs through fun, social actions.

Why JustMemeIt?

- Boosts Onchain Activity: Votes and mints are recorded via SEI MCP, increasing wallet usage.
- Builds Community Culture: Memes fuel virality and create a playful SEI culture beyond finance.
- Onboards Creators: Meme lovers and newbies get their first blockchain experience.
- Positions SEI as the Cultural Chain: By owning meme culture, SEI stands out from other blockchains focused only on DeFi and Infra.

Project Structure

```
backend/           # Node.js/Express backend (API, DB, NFT minting, MemeAI)
  models/          # Mongoose models (Meme, Vote, Winner)
  utils/           # Pinata, Magic Eden, NFT minting helpers
  uploads/         # Uploaded meme images
contracts/         # Solidity smart contracts (NFT minting)
public/            # Frontend static files, generated memes
sei-mcp-server/    # Blockchain service layer (SEI MCP, EVM tools)
src/               # React frontend (profile, voting, meme generator)
xbot/              # Twitter bot (Python, Tweepy)
```

Key Components

- [xbot/memeit_bot.py]: 
  Listens for mentions on Twitter, downloads meme images, generates captions with AI and uploads memes to the backend.

- [backend/models/Meme.js]:  
  Stores meme metadata, user info and image URLs.

- [backend/utils/pinataNFT.js]:  
  Handles uploading meme images and metadata to IPFS via Pinata.

- [contracts/MemeItWinner.sol]: 
  ERC721 smart contract for minting winning memes reward NFTs.

- [sei-mcp-server/]:
  Provides blockchain services (balance, voting, NFT minting) via Model Context Protocol for seamless AI and web integration.

- [src/]:  
  React frontend for user profiles, meme editing, voting and MemeAI generator.


Security & Onboarding

- Private keys are never stored; all signing is done in-memory.
- Onboarding is gamified—users set up wallets and interact with SEI through fun meme actions.
- All NFT minting and voting is onchain and transparent.

Setup & Usage

Prerequisites

- Node.js 18+ and/or Bun 1.0+
- MongoDB
- Python 3.10+ (for xbot)
- Twitter API credentials
- Pinata API keys

1. Clone the repo

```bash
git clone https://github.com/0xzorak/justmemeit.git
cd justmemeit
```

2. Install dependencies

```bash
# Backend
cd backend
npm install --legacy-peer-deps

# Frontend
cd ../
npm install --legacy-peer-deps

# SEI MCP Server
cd sei-mcp-server
bun install 

```

3. Configure Environment Variables

- Copy `.env.example` to `.env` in each relevant folder and fill in your secrets (Twitter, MongoDB, Pinata, SEI private key, etc).

4. Run the Services

- Backend:  
  `node backend/server`
- Frontend:
  `npm start`
- SEI MCP Server:  
  `cd sei-mcp-server && npm run start:http`
- XBot: 
  `cd xbot && python memeit_bot.py`

API Reference

- Backend API:
  Handles meme uploads, voting, and NFT minting endpoints.
- SEI MCP Server:
  Exposes blockchain tools and resources for balance, voting, NFT minting, and more.  
  See [sei-mcp-server/README.md] for full API docs.

Credits

- Built with [SEI Protocol](https://sei.io).
