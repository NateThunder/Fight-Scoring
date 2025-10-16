//SPDX-License-Identifier: MIT

pragma solidity ^0.8.28;

import "./FightPoint.sol";

contract DistributeFunds is FightPoint {
    
    mapping (uint => uint) public MatchPayout;
    uint individualPay;
 
    //function to set the payout for the match  
    function setMatchPayout(uint _payout, uint _fightId) public onlyOwner {

        (uint AmountOfWinners,,) = ranking(_fightId);
        individualPay = _payout / AmountOfWinners;        
    }
}