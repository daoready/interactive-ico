pragma solidity ^0.4.18;

import '../token/MintableBonusToken.sol';
import 'zeppelin-solidity/contracts/token/DetailedERC20.sol';

contract CrowdsaleBonusToken is DetailedERC20, MintableBonusToken {

    function CrowdsaleBonusToken( address _ico_token)
        DetailedERC20("Bonus Token", "BONUS", 18)
        BonusToken( _ico_token, 0 ) public {
    }

}