pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/DetailedERC20.sol';

contract CpaCrowdsaleToken is DetailedERC20, MintableToken {

    function CpaCrowdsaleToken()
        DetailedERC20("CPA Crowdsale Token", "CPASALE", 18) public {
    }

}