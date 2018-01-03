pragma solidity ^0.4.18;

import './BonusToken.sol';
import 'zeppelin-solidity/contracts/token/MintableToken.sol';

/**
 * @title MintableBonusToken
 * @dev MintableBonusToken is a BonusToken, that can be minted as a reward
 *
 * MintableBonusToken tokens can be distributed to owners before or in the progress of ICO crowdsale.
 * They represent the right to get ICO tokens now, or sometime in the future.
 *
 * MintableBonusToken tokens can be minted to owners as bounties as a reward for some usefull activities,
 * or as bonuses for ICO participants.
 *
 * @author DAO Ready <info@daoready.com>
 */
contract MintableBonusToken is MintableToken, BonusToken {

    function mint(address _to, uint256 _amount) onlyOwner canMint public returns (bool) {

        if(has_ico_tokens(_amount) ){
            require(ico_token.transfer(_to, _amount));
            return true;
        }else{
            return super.mint(_to, _amount);
        }
    }

}