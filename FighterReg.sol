//SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "./JudgeReg.sol";


contract FighterReg is JudgeReg {

// Event to be able to easily be seen on system =============
    event NewFighter(uint fighterId, string fighterName);

// Setting modifier owner of for fighters =====================



// Getting the databse of fighters and judges ==================
    struct MMAfighter {
        string name;
        uint32 win;
        uint32 loss;
        uint32 draw;
        uint16 noContest;
        uint8 weightCategoryLbs;
    }

// defining an array for Judges and MMA fighters =================
    MMAfighter[] public fighters;

// index position 1 in the array in case of a draw to avoid confusion 

    constructor() {
    // Push a dummy fighter at index 0
    fighters.push(MMAfighter("", 0, 0, 0, 0, 0));
}


// Mapping of users to ID number =============================
    mapping (uint => address) public fighterToOwner;    
    mapping (uint => MMAfighter) public fighterIdToFighter;
    mapping (address => uint256) fighterbalance;

// Modifier of fighter requiring owner ===============================

    modifier onlyFighter(uint _judgeId) {
        require(msg.sender == fighterToOwner[_judgeId]);
        _;
    }


// Register fighter ===============================================    
    function _registerMMAFighter(string memory _name, uint32 _wins, uint32 _losses, uint32 _draws, uint16 _nc, uint8 _weight) public {
        fighters.push(MMAfighter(_name, _wins, _losses, _draws, _nc, _weight));
        uint256 id = fighters.length - 1;
        fighterToOwner[id] = msg.sender;
        emit NewFighter(id, _name);
    }
}