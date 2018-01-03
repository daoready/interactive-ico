pragma solidity ^0.4.18;

import '../token/MintableBonusToken.sol';
import 'zeppelin-solidity/contracts/token/DetailedERC20.sol';

contract CpaBonusToken is DetailedERC20, MintableBonusToken {

    function CpaBonusToken( address _ico_token)
        DetailedERC20("CPA Token", "CPA", 18)
        BonusToken( _ico_token, 0 ) public {
    }

}