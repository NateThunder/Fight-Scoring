//SPDX-License-Identifier: MIT

pragma solidity ^0.8.26;

import "./JudgeConsensus.sol";

contract JudgeRank is JudgeConsensus {
    function ranking (uint _fightId) public {
        for (uint z = 0; z < results.length; z++) {
            if (results[z].winnerId == JudgingMajority(_fightId) || results[z].fightId == _fightId) {
                judges[results[z].judgeId].rank += 1;
                judges[results[z].judgeId].rightDecision += 1;
            }
            else {
                judges[results[z].judgeId].rank -= 1;
                judges[results[z].judgeId].wrongDecision += 1;                
            }
        }
    }
}