// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";

contract DoNftCollection is ERC721URIStorage, Ownable {
    uint256 private _nextTokenId = 1;

    constructor(
        string memory name_,
        string memory symbol_,
        address initialOwner
    ) ERC721(name_, symbol_) Ownable(initialOwner) {}

    function mintNFT(address to, string memory metadataURI) external onlyOwner returns (uint256) {
        uint256 tokenId = _nextTokenId;
        _nextTokenId += 1;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, metadataURI);

        return tokenId;
    }

    function nextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
}
