const { ethers } = require("ethers");
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const NFT = require('../models/NFT');

const DEPLOYER_PRIVATE_KEY = (process.env.DEPLOYER_PRIVATE_KEY || "").trim();

if (!DEPLOYER_PRIVATE_KEY.startsWith("0x") || DEPLOYER_PRIVATE_KEY.length !== 66) {
  throw new Error("DEPLOYER_PRIVATE_KEY is invalid. Must start with 0x and be 66 characters long.");
}

const provider = new ethers.JsonRpcProvider(process.env.SEI_EVM_RPC);
const contractABI = require("./MemeItWinnerABI.json");

const CONTRACT_ADDRESS = process.env.MEMEITWINNER_CONTRACT;
// const MARKETPLACE = process.env.MARKETPLACE_CONTRACT;

async function mintNFT(to, tokenURI, image, name, source = 'reset') {
  const wallet = new ethers.Wallet(DEPLOYER_PRIVATE_KEY, provider);
  const contract = new ethers.Contract(CONTRACT_ADDRESS, contractABI, wallet);

  const tx = await contract.mintNFT(to, tokenURI);
  const receipt = await tx.wait();

  // Find the Transfer event and extract tokenId
  let tokenId;
  for (const log of receipt.logs) {
    try {
      const parsed = contract.interface.parseLog(log);
      if (parsed.name === "Transfer") {
        tokenId = parsed.args.tokenId.toString();
        break;
      }
    } catch {}
  }

  if (!tokenId) throw new Error("Could not find tokenId in mint receipt");

  await NFT.create({
    tokenId,
    owner: to.toLowerCase(),
    image,
    name,
    metadataUri: tokenURI,
    source,
  });

  return { txHash: tx.hash, tokenId };
}

module.exports = { mintNFT };
