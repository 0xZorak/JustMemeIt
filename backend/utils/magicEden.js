const axios = require("axios");
const { ethers } = require("ethers");
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });

const API_URL = process.env.MAGIC_EDEN_API;
const API_KEY = process.env.MAGIC_EDEN_API_KEY;
const MARKETPLACE = process.env.MAGIC_EDEN_MARKETPLACE;
const RPC_URL = process.env.SEI_EVM_RPC;
const PRIVATE_KEY = (process.env.DEPLOYER_PRIVATE_KEY || "").trim();
const DEFAULT_LIST_PRICE_SEI = process.env.DEFAULT_LIST_PRICE_SEI || "0.5";

const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);

async function listNFTOnMagicEden({ contractAddress, tokenId, priceInSEI }) {
  const priceWei = ethers.parseEther(priceInSEI || DEFAULT_LIST_PRICE_SEI);
  const order = {
    maker: wallet.address,
    contract: contractAddress,
    tokenId: tokenId.toString(),
    price: priceWei.toString(),
    marketplace: MARKETPLACE,
    chainId: 1329,
    expiration: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
  };

  await approveMarketplace(contractAddress);
  const signature = await signOrder(order);

  try {
    const response = await axios.post(API_URL, { order, signature }, {
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        "Content-Type": "application/json",
      },
    });
    console.log("Magic Eden listing response:", response.data);
    return response.data;
  } catch (err) {
    console.error("Magic Eden listing failed:", err.response?.data || err.message);
    throw err;
  }
}

async function signOrder(order) {
  const domain = {
    name: "MagicEden",
    version: "1",
    chainId: 1329,
    verifyingContract: MARKETPLACE,
  };
  const types = {
    Order: [
      { name: "maker", type: "address" },
      { name: "contract", type: "address" },
      { name: "tokenId", type: "uint256" },
      { name: "price", type: "uint256" },
      { name: "expiration", type: "uint256" },
      { name: "marketplace", type: "address" },
      { name: "chainId", type: "uint256" },
    ],
  };
  const signature = await wallet._signTypedData(domain, types, order);
  return signature;
}

async function approveMarketplace(contractAddress) {
  const contract = new ethers.Contract(contractAddress, require("./MemeItWinnerABI.json"), wallet);
  const tx = await contract.setApprovalForAll(MARKETPLACE, true);
  await tx.wait();
  console.log("Marketplace approved for contract:", contractAddress);
}

module.exports = { listNFTOnMagicEden, approveMarketplace };