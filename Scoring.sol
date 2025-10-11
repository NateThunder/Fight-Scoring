//SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import "./matchreg.sol";

// contract for scoring the fight =============================

contract Scoring is MatchReg {

    uint8 public constant roundsAmount = 5;// matches.rounds;

    struct Fight {
        uint[roundsAmount] fighterAScore;
        uint[roundsAmount] fighterBScore;
    }

    Fight[] private fights;    

    modifier scoreLimit(uint _scoreA, uint8 _scoreB){
        require(_scoreA < 11 && _scoreB < 11, "maximum Score is 10");
        _;
    }

    function judgeScore(uint _fightId, uint _roundId, uint8 _scoreA, uint8 _scoreB) public scoreLimit(_scoreA, _scoreB) {

        fights[_fightId].fighterAScore[_roundId] = _scoreA;
        fights[_fightId].fighterBScore[_roundId] = _scoreB;
    }
    }
