import React, { useState } from "react";
import { useAccount } from "wagmi";
import "../styles/memeai.css";

const STYLE_OPTIONS = [
  { value: "popo", label: "$POPO" },
  { value: "froggy", label: "$FROGGY" },
  { value: "seiyan", label: "$SEIYAN" },
];

const MemeAI = () => {
  const { address } = useAccount();
  const [selectedStyle, setSelectedStyle] = useState("popo");
  const [imageFile, setImageFile] = useState(null);
  const [resultImage, setResultImage] = useState(null);
  const [resultImagePath, setResultImagePath] = useState("");
  const [loading, setLoading] = useState(false);
  const [minting, setMinting] = useState(false);
  const [alertMsg, setAlertMsg] = useState("");
  const [mintMsg, setMintMsg] = useState("");

  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
    setResultImage(null);
    setResultImagePath("");
    setAlertMsg("");
    setMintMsg("");
  };

  const handleStyleChange = (e) => setSelectedStyle(e.target.value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imageFile) {
      setAlertMsg("Please upload an image.");
      return;
    }
    setLoading(true);
    setAlertMsg("");
    setMintMsg("");
    const formData = new FormData();
    formData.append("image", imageFile);
    formData.append("style", selectedStyle);

    try {
      const res = await fetch("https://justmemeit.onrender.com/api/memeai/generate", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      if (data.image) {
        setResultImage(`https://justmemeit.onrender.com${data.image}`);
        setResultImagePath(data.image);
      } else {
        setAlertMsg(data.error || "Failed to generate meme.");
      }
    } catch (err) {
      setAlertMsg("Error contacting AI server.");
    }
    setLoading(false);
  };

  const handleMintNFT = async () => {
    setMinting(true);
    setMintMsg("");
    try {
      const res = await fetch("https://justmemeit.onrender.com/api/ai-meme/mint-nft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imagePath: resultImagePath,
          style: selectedStyle,
          walletAddress: address,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMintMsg(`NFT minted! Tx: ${data.txHash}`);
      } else {
        setMintMsg(data.error || "Failed to mint NFT.");
      }
    } catch (err) {
      setMintMsg("Error contacting NFT server.");
    }
    setMinting(false);
  };

  return (
    <div className="memeai-flex">
      <div className={`memeai-form-container${resultImage ? "" : " memeai-center"}`}>
        <h2 className="memeai-title">MemeAI Generator</h2>
        <form className="memeai-form" onSubmit={handleSubmit}>
          <label className="memeai-label">
            Upload Image:
            <input
              type="file"
              accept="image/*"
              className="memeai-input"
              onChange={handleFileChange}
              disabled={loading}
            />
          </label>
          <label className="memeai-label">
            Select Style:
            <select
              value={selectedStyle}
              onChange={handleStyleChange}
              className="memeai-select"
              disabled={loading}
            >
              {STYLE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </label>
          <button type="submit" className="memeai-btn" disabled={loading}>
            {loading ? "Generating..." : "Generate Meme"}
          </button>
        </form>
        {alertMsg && <div className="memeai-alert">{alertMsg}</div>}
      </div>
      {resultImage && (
        <div className="memeai-result-container">
          <div className="memeai-result">
            <img src={resultImage} alt="MemeAI Result" className="memeai-img" />
            <div className="memeai-btn-row">
              <button
                className="memeai-download"
                onClick={() => window.open(resultImage, "_blank")}
                type="button"
              >
                Download Meme
              </button>
              <button
                className="memeai-nft-btn"
                onClick={handleMintNFT}
                disabled={minting}
              >
                {minting ? "Minting NFT..." : "Convert to NFT"}
              </button>
            </div>
            {mintMsg && <div className="memeai-mint-alert">{mintMsg}</div>}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemeAI;