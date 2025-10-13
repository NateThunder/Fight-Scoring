//SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import "./Scoring.sol";

contract JudgeConsensus is Scoring {

    struct Result {
        uint fightId;
        uint judgeId;
        uint winnerId; 
    }

    Result[] public results;


    function JudgingMajority(uint _fightId) public view returns (uint) {
        
        uint count = 0;
        uint winnerACount = 0;
        uint winnerBCount = 0;
        uint winnerA = 0;
        uint winnerB = 0; 
        

        for (uint i = 0; i < fights.length; i++) {
            if (fights[i].fightId == _fightId) {
                count++;
            }
        }

        Result[] memory resultArray = new Result[](count);

        uint index;

        for ( uint i = 0; i < fights.length; i++) {         
            if (fights[i].fightId == _fightId) {
                (uint _winnerId,,) = judgeWinner(_fightId, fights[i].judgeId);
            
                resultArray[index++] = Result({
                    fightId: _fightId,
                    judgeId: fights[i].judgeId,
                    winnerId: _winnerId
                });             
            }
        }

        for (uint s = 0; s < index - 1; s++) {
            if (resultArray[0].winnerId == resultArray[s].winnerId) {
                winnerACount++;
                winnerA = resultArray[s].winnerId;
            }
            else {
                winnerBCount++;
                winnerB = resultArray[s].winnerId;
            }
        }

        return winnerACount > winnerBCount ? winnerA : winnerB; 
    }

}