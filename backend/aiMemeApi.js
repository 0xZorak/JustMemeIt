const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { Client } = require("@gradio/client");
const axios = require('axios');
const crypto = require('crypto');
require('dotenv').config({ path: path.resolve(__dirname, '../../.env') });
const { mintNFT } = require('./utils/mintNFT');
const { uploadMemeAndMetadataToIPFS } = require('./utils/pinataNFT');

const router = express.Router();
const upload = multer({ dest: path.join(__dirname, '../uploads') });

const STYLE_PROMPTS = {
    popo: "transform this character into a cartoon cat-style drawing with bold outlines and smooth flat colors. Change the skin to cat-like fur with orange and white coloring, matching the style of the reference image. Add cat facial features: a cat-shaped face, fur texture, whiskers, and pointed ears that fit naturally with the head shape of the character. Keep the original clothing from the uploaded image intact and adapt it seamlessly into the cartoon style. Maintain the overall proportions and pose of the original character, but render it in the same clean, meme/cartoon aesthetic as the reference.",
    froggy: "transform this character into a cartoon frog-style drawing with bold outlines and smooth flat colors. Change the skin color to a solid bright green . Keep the original clothing from the uploaded image intact and adapt it naturally into the cartoon style. Give the character a frog-like face (, cartoon eyes, red blush spots on the cheeks) while preserving the head shape from the original character . Maintain the original background of the image, converting it into the same cartoon/meme art style for consistency.",
    seiyan: "transform this character into a cartoon-style drawing with bold outlines and flat colors. Give them bright golden spiky Super Saiyan hair that fits perfectly on their head. Change their skin color to a solid vibrant red."
};

router.post('/transform', upload.single('image'), async (req, res) => {
    let imagePath;
    try {
        const style = req.body.style;
        if (!req.file || !style || !STYLE_PROMPTS[style]) {
            return res.status(400).json({ error: 'Missing image or style' });
        }
        const prompt = STYLE_PROMPTS[style];
        imagePath = req.file.path;

        // Read image as buffer
        const imageBuffer = fs.readFileSync(imagePath);

        // Connect to Gradio Space
        console.log("Connecting to Gradio Space: black-forest-labs/FLUX.1-Kontext-Dev");
        console.log("Using HF_API_TOKEN:", process.env.HF_API_TOKEN ? "Yes" : "No");

        const client = await Client.connect("black-forest-labs/FLUX.1-Kontext-Dev", {
            hf_token: process.env.HF_API_TOKEN
        });

        // Call /infer endpoint
        const result = await client.predict("/infer", {
            input_image: imageBuffer,
            prompt: prompt,
            seed: 0,
            randomize_seed: true,
            guidance_scale: 2.5,
            steps: 28
        });

        if (!result || !result.data || !result.data[0] || !result.data[0].url) {
            throw new Error("No image URL returned from Hugging Face Space");
        }

        // Download the generated image from Hugging Face Space
        const imageUrl = result.data[0].url;
        console.log("Generated image URL:", imageUrl);
        const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
        if (response.status !== 200) throw new Error("Failed to fetch generated image from Space");
        const buffer = Buffer.from(response.data);

        // Save to public/generated_memes/
        const outDir = path.join(__dirname, '../public/generated_memes');
        if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
        const filename = `memeai_${crypto.randomBytes(8).toString('hex')}.png`;
        const outPath = path.join(outDir, filename);
        fs.writeFileSync(outPath, buffer);

        // Return local URL for frontend
        res.json({ image: `/generated_memes/${filename}`, seed: result.data[1] });

    } catch (err) {
        console.error('AI Meme Transform Error:', err.response?.data || err.message || err);
        res.status(500).json({ error: 'AI transformation failed' });
    } finally {
        if (req.file && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
    }
});

router.post('/mint-nft', async (req, res) => {
    try {
        const { imagePath, style, walletAddress } = req.body;
        if (!imagePath || !style || !walletAddress) {
            return res.status(400).json({ error: 'Missing image, style, or wallet address' });
        }
        // Generate metadata and upload to IPFS
        const title = `MemeAI ${style.toUpperCase()} Meme`;
        const description = `Generated meme in ${style} style using MemeAI.`;
        const metadata = await uploadMemeAndMetadataToIPFS({
            imagePath: path.join(__dirname, '../public', imagePath),
            title,
            description,
            creatorWallet: walletAddress
        });

        // Mint NFT to user's wallet
        const receipt = await mintNFT(walletAddress, metadata.metadataUrl, title);
        res.json({ success: true, txHash: receipt.hash });
    } catch (err) {
        console.error('Mint NFT Error:', err.message || err);
        res.status(500).json({ error: 'NFT minting failed' });
    }
});

module.exports = router;
