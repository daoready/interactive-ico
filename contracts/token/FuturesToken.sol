pragma solidity ^0.4.18;

import '../token/ERC233Token.sol';

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/token/BurnableToken.sol';
import 'zeppelin-solidity/contracts/token/DetailedERC20.sol';

/**
 * @title FuturesToken
 * @dev FuturesToken is a token, used for InteractiveCrowdsale
 *
 * FuturesToken represents the right of owner to receive ICO tokens when it will start,
 * or exhange them back to Ether before the InteractiveCrowdsale finalized.
 *
 * @author DAO Ready <info@daoready.com>
 */
contract FuturesToken is ERC233Token, MintableToken, BurnableToken, DetailedERC20 {

    function FuturesToken(string _name, string _symbol)
        DetailedERC20( _name, _symbol, 18) public {
    }

}