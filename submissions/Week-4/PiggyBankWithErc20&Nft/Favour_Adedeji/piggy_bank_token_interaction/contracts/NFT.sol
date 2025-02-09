// SPDX-License-Identifier: MIT
pragma solidity ^0.8.26;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NewNFT is ERC721 {
    
    uint256 private s_tokenId = 1;

    constructor() ERC721("Dommy", "DOM") {}
    
    function mintNFT(address to) public returns(uint256) {
        _safeMint(to, s_tokenId);
        s_tokenId = s_tokenId + 1;
        return s_tokenId;
    }

    function getTokenId() public view returns(uint256) {
        return s_tokenId;
    }
}