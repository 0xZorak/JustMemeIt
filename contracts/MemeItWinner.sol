// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MemeItWinner is ERC721URIStorage, Ownable {
    uint256 private _tokenIds;

    event NFTMinted(address indexed to, uint256 indexed tokenId, string uri);

    constructor(address initialOwner)
        ERC721("MemeItWinner", "MIW")
        Ownable(initialOwner)
    {}

    function mintNFT(address to, string memory uri) public onlyOwner returns (uint256) {
        _tokenIds += 1;
        uint256 newTokenId = _tokenIds;
        _safeMint(to, newTokenId);
        _setTokenURI(newTokenId, uri);
        emit NFTMinted(to, newTokenId, uri);
        return newTokenId;
    }
}