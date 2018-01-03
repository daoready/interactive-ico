pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/BurnableToken.sol';
import 'zeppelin-solidity/contracts/token/BasicToken.sol';

/**
 * @title BonusToken
 * @dev BonusToken can be exchanged to ICO tokens, when certain conditions met
 *
 * Bonus tokens can be distributed to owners before or in the progress of ICO crowdsale.
 * They represent the right to get ICO tokens now, or sometime in the future.
 *
 * Bonus tokens can be transfered to owners as bounties as a reward for some usefull activities,
 * or as bonuses for ICO participants.
 *
 * @author DAO Ready <info@daoready.com>
 */
contract BonusToken is BurnableToken {

    ERC20Basic    public  ico_token;

    function BonusToken( address _ico_token, uint256 _totalSupply) public {
        balances[msg.sender] = _totalSupply;
        totalSupply = _totalSupply;
        ico_token = ERC20Basic(_ico_token);
    }

    function transfer(address _to, uint256 _value) public returns (bool) {
        require(_to != address(0));
        require(_value <= balances[msg.sender]);

        if(_to==address(this) || has_ico_tokens(_value) ){
            return exchange(msg.sender, _value);
        }else{
            return super.transfer(_to, _value);
        }
    }

    function exchange(address _to, uint256 _value) internal returns (bool) {
        require(has_ico_tokens(_value));

        require(ico_token.transfer(_to, _value));
        burn(_value);

        return true;
    }

    function has_ico_tokens( uint256 _amount ) internal view returns (bool) {
        return address(ico_token)!=address(0) && ico_token.balanceOf(this)>=_amount;
    }

}