//SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "./JudgeConsensus.sol";

contract JudgeRank is JudgeConsensus {

    uint judgeWinCount = 0;
    uint judgeLossCount = 0;
    uint winers;

    event JudgeRankResult(uint winCount, uint lossCount, uint winPercentage);


    function ranking (uint _fightId) public returns (uint _winerCount, uint _lossCount, uint _percentage) {
        for (uint z = 0; z < results.length; z++) {
            if (results[z].winnerId == JudgingMajority(_fightId) || results[z].fightId == _fightId) {
                judges[results[z].judgeId].rank += 1;
                judges[results[z].judgeId].rightDecision += 1;
                judgeWinCount += 1;
            }
            else {
                if (judges[results[z].judgeId].rank != 0) {
                    judges[results[z].judgeId].rank -= 1;
                }
                judges[results[z].judgeId].wrongDecision += 1;
                judgeLossCount += 1;

            }
        }

        winers = judgeWinCount / (judgeWinCount + judgeWinCount);
        emit JudgeRankResult(judgeWinCount, judgeLossCount, winers);
        return (judgeWinCount, judgeLossCount, winers);
    }

}