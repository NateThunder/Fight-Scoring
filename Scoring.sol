//SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import "./MatchReg.sol";

// contract for scoring the fight =============================

contract Scoring is MatchReg {

    event FightScore(uint fightId, uint roundId, uint8 scoreA, uint8 scoreB);

    struct Fight {
        uint fightId;
        uint roundId;
        uint fighterAScore;
        uint fighterBScore;
    }

    Fight[] private fights;    

    modifier scoreLimit(uint _scoreA, uint8 _scoreB){
        require(_scoreA < 11 && _scoreB < 11, "maximum Score is 10");
        _;
    }

    function judgeScore(uint _fightId, uint _roundId, uint8 _scoreA, uint8 _scoreB) public scoreLimit(_scoreA, _scoreB) {
        require(_roundId < matches[_fightId].rounds, "Invalid Rounds");
        fights.push(Fight({
            fightId: _fightId,
            roundId: _roundId,
            fighterAScore: _scoreA,
            fighterBScore: _scoreB
        }));

        emit FightScore(_fightId, _roundId, _scoreA, _scoreB);
    }

    function winner(uint _fightId) public view returns (uint, string memory) {
        uint scoreA = 0;
        uint scoreB = 0;
        uint winnerId;
        string memory winnerName;

        for (uint x = 0; x < fights.length; x++) {
            if (fights[x].fightId == _fightId) {
                scoreA += fights[x].fighterAScore;
                scoreB += fights[x].fighterBScore;
            }
        }

        if (scoreA > scoreB) {
            winnerId = matches[_fightId].fighterAId;
            winnerName = (fighters[winnerId].name);
        } else if (scoreB > scoreA) {
            winnerId = matches[_fightId].fighterBId;
            winnerName = (fighters[winnerId].name);
        } else {
            return (0,"draw");
        }

        return (winnerId, winnerName);

    }


    }