const path = require("path");
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const fs = require("fs");
const pinataSDK = require('@pinata/sdk');

const pinata = new pinataSDK(process.env.PINATA_API_KEY, process.env.PINATA_SECRET_API_KEY);

async function uploadMemeAndMetadataToIPFS({ imagePath, title, description, creatorWallet }) {

  // 1. Upload image file to IPFS
  const readableStream = fs.createReadStream(imagePath);
  const imageResult = await pinata.pinFileToIPFS(readableStream, {
    pinataMetadata: { name: path.basename(imagePath) }
  });
  const imageCID = imageResult.IpfsHash;
  const imageUrl = `ipfs://${imageCID}`;

  // 2. Create ERC-721 metadata JSON
  const metadata = {
    name: title,
    description,
    image: imageUrl,
    attributes: [
      { trait_type: "Creator", value: creatorWallet }
    ]
  };

  // 3. Upload metadata JSON to IPFS
  const metadataResult = await pinata.pinJSONToIPFS(metadata, {
    pinataMetadata: { name: `${title}-metadata` }
  });
  const metadataCID = metadataResult.IpfsHash;

  return {
    metadataCID,
    metadataUrl: `ipfs://${metadataCID}`,
    imageCID,
    imageUrl
  };
}

module.exports = { uploadMemeAndMetadataToIPFS };
