// SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import "./fighterreg.sol";

contract MatchReg is FighterReg{

    event NewMatch(uint _matchId, uint _fighterAId, uint _fighterBId, uint _rounds);

    struct MatchInfo {
        uint fighterAId;
        uint fighterBId;
        uint8 rounds;
    }

    MatchInfo[] public matches;

    modifier roundLimit(uint8 _rounds) {
        require(_rounds == 3 || _rounds == 5, "Out with round limit");
        _;
    }

    function setMatch(uint _fighterAId, uint _fighterBId, uint8 _rounds) public roundLimit(_rounds) {
        matches.push(MatchInfo(_fighterAId, _fighterBId, _rounds));
        uint matchId = matches.length - 1;
        emit NewMatch(matchId, _fighterAId, _fighterBId, _rounds);
    } 
    
}