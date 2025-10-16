//SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "./JudgeConsensus.sol";
import "./FightPoint.sol";

contract JudgeRankPayout is JudgeConsensus, FightPoint{

    uint judgeCountA = 0;
    uint judgeCountB = 0;
    uint winner = 0;
    uint[] winningJudges;
    uint individualPay;

    mapping (uint => uint) public MatchPayout;
    mapping (uint => uint[]) winningJudgeA;
    mapping (uint => uint[]) winningJudgeB;

    event JudgeRankResult(uint winCount, uint lossCount, uint winPercentage);




    function ranking (uint _fightId) public returns (uint _winerCount, uint _lossCount, uint _percentage) {
        for (uint z = 0; z < results.length; z++) {
            if (results[z].winnerId == JudgingMajority(_fightId) && results[z].fightId == _fightId) {
                judges[results[z].judgeId].rank += 1;
                judges[results[z].judgeId].rightDecision += 1;
                judgeCountA += 1;
                winningJudgeA[_fightId].push(results[z].judgeId);
            }
            else {
                if (judges[results[z].judgeId].rank != 0) {
                    judges[results[z].judgeId].rank -= 1;
                }
                judges[results[z].judgeId].wrongDecision += 1;
                judgeCountB += 1;
                winningJudgeA[_fightId].push(results[z].judgeId);

            }
        }

        uint winningJudge = judgeCountA > judgeCountB ? judgeCountA : judgeCountB;
        uint losingJudge = winningJudge == judgeCountA ? judgeCountB : judgeCountA;
        winner = winningJudge * 100 / (judgeCountA + judgeCountB);
        emit JudgeRankResult(winningJudge, losingJudge, winner);
        return (winningJudge, losingJudge, winner);
    }






    function setMatchPayout(uint _payout, uint _fightId) public onlyOwner {

        (uint AmountOfWinners,,) = ranking(_fightId);
        individualPay = _payout / AmountOfWinners;

        if(judgeCountA > judgeCountB) {

            for (uint i = 0; i < winningJudges.length; i++) {
                _transfer(owner(), judgeToOwner[winningJudgeA[_fightId][i]], individualPay);
            }
        }
        else {

            for (uint i = 0; i < winningJudges.length; i++) {
                _transfer(owner(), judgeToOwner[winningJudgeB[_fightId][i]], individualPay);
            }
        }    
    } 

}