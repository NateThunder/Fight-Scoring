//SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import "@openzeppelin/contracts/access/Ownable.sol";


contract JudgeReg is Ownable {
// Constructor to link to openzepplin code ============================    
    constructor() Ownable(msg.sender) {}

// Event to be able to easily be seen on system ======================
    event NewJudge(uint judgeId, string judgeName);

// Getting the databse of fighters and judges =========================
    struct Judge {
        string name;
        uint16 rank;
        uint32 rightDecision;
        uint16 wrongDecision;
    }

// defining an array for MMA fighters ==================================
    Judge[] public judges;

// Mapping of users to ID number =======================================
    mapping (uint => address) public judgeToOwner;
    mapping (address => uint) public ownerToJudge;
    mapping (address => uint256) judgeBalance;

// Setting modifier for the owner of for the judges ====================

    modifier onlyJudge(uint _judgeId) {
        require(msg.sender == judgeToOwner[_judgeId], "Wrong judge address");
        _;
    }

// Register judge ====================================================
    function _registerJudge(string memory _name) public  { 
        require(ownerToJudge[msg.sender] == 0 && judgeToOwner[0] != msg.sender, "Judge already exsists"); // prevents multiple judges per address 
        judges.push(Judge(_name, 1, 0, 0));
        uint256 id = judges.length - 1;
        judgeToOwner[id] = msg.sender;
        ownerToJudge[msg.sender] = id;
        emit NewJudge(id, _name);
    }
}
