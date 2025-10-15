//SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;


import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

contract FightPoint is ERC20, Ownable {
    constructor(address initialOwner)
        ERC20("FightPoint", "FTPT") 
        Ownable(initialOwner) 
        {
            _mint(msg.sender, 1000 * 10 ** decimals());
        }
}