// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import "./FighterReg.sol";

contract MatchReg is FighterReg{
// creating event for match information for front end ===================================

    event NewMatch(uint _matchId, uint _fighterAId, uint _fighterBId, uint _rounds);

// struct for match information ========================================================

    struct MatchInfo {
        uint fighterAId;
        uint fighterBId;
        uint8 rounds;
    }

// struct for match information ============================================================

    MatchInfo[] public matches;

// modifier for amount of rounds in MMA fights =============================================

    modifier roundLimit(uint8 _rounds) {
        require(_rounds == 3 || _rounds == 5, "Out with round limit");
        _;
    }

// Adding match information to array struct =================================================

    function setMatch(uint _fighterAId, uint _fighterBId, uint8 _rounds) public roundLimit(_rounds) {
        matches.push(MatchInfo(_fighterAId, _fighterBId, _rounds));
        uint matchId = matches.length - 1;
        emit NewMatch(matchId, _fighterAId, _fighterBId, _rounds);  //  fire it for front end
    } 
    
}