//SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import "./MatchReg.sol";

// contract for scoring the fight ====================================================================

contract Scoring is MatchReg {

    event FightScore(uint fightId, uint roundId, uint8 scoreA, uint8 scoreB, uint judgeId);

// struct for judges scorecard =======================================================================

    struct Fight {
        uint fightId; // fightId = matches[fightId]
        uint roundId;
        uint fighterAScore;
        uint fighterBScore;
        uint judgeId; // judges[judgesId].name
    }

    Fight[] public fights;    // array of fight struct
    
    
// Modifier to make sure score is within limit -------------------------------------------------------

    modifier scoreLimit(uint _scoreA, uint8 _scoreB){
        require(_scoreA < 11 && _scoreB < 11, "maximum Score is 10");
        _;
    }

// Function for the score card  ----------------------------------------------------------------------

    function judgeScore(uint _fightId, uint _roundId, uint8 _scoreA, uint8 _scoreB, uint _judgeId) public scoreLimit(_scoreA, _scoreB) onlyJudge(_judgeId) {
        require(_roundId < matches[_fightId].rounds, "Invalid Rounds");
        fights.push(Fight({
            fightId: _fightId,
            roundId: _roundId,
            fighterAScore: _scoreA,
            fighterBScore: _scoreB,
            judgeId: _judgeId
        }));

        emit FightScore(_fightId, _roundId, _scoreA, _scoreB, _judgeId); // emits scorcard information
    }

// function to calvulate the winner based on the scorecard ------------------------------------------

    function judgeWinner(uint _fightId, uint _judgeId) public view returns (uint, string memory, string memory) { // view function for gas saving
        uint scoreA = 0;
        uint scoreB = 0;
        uint winnerId;
        string memory winnerName;

        for (uint x = 0; x < fights.length; x++) {
            if (fights[x].fightId == _fightId && fights[x].judgeId == _judgeId) {
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
            return (0,"draw", judges[_judgeId].name);
        }

        

        return (winnerId, winnerName, judges[_judgeId].name);

    }


    }