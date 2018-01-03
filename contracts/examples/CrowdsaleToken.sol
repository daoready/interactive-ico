pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/DetailedERC20.sol';

contract CrowdsaleToken is DetailedERC20, MintableToken {

    function CrowdsaleToken()
        DetailedERC20("Crowdsale Token", "SALE", 18) public {
    }

}