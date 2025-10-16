//SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;


import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./JudgeRank.sol";

contract FightPoint is ERC20, JudgeRank{
    constructor()
        ERC20("FightPoint", "FTPT") 
        {
            _mint(msg.sender, 1000 * 10 ** decimals());
        }
}