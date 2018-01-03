pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/MintableToken.sol';
import 'zeppelin-solidity/contracts/crowdsale/Crowdsale.sol';

import '../util/StringUtils.sol';

/**
 * @title CpaCrowdsale
 * @dev CpaCrowdsale pays affiliates for invited ICO participants.
 *
 * Affiliate gives participant credentials ( for example, as QR code or instructions) including his address as data.
 * When participant buys token, affiliate gets a payout in tokens.
 * Payout can be arranged in ICO tokens, in MintableBonusTokens, or in FutureToken's
 * that can be exchanged later on ether or ICO tokens.
 *
 * @author DAO Ready <info@daoready.com>
 */
contract CpaCrowdsale is Crowdsale {

    // token, granted to affiliate for invited participant
    MintableToken public cpa_token;

    // converting bytes -> address
    using StringUtils for bytes;

    // Before con
    function CpaCrowdsale( uint256 _startTime,  // crowdsale start time, look Crowdsale contract
                            uint256 _endTime,   // crowdsale end time, look Crowdsale contract
                            uint256 _rate,      // crowdsale rate, look Crowdsale contract
                            address _wallet,    // crowdsale wallet, look Crowdsale contract
                            address _token,     // crowdsale token, look Crowdsale contract
                            address _cpa_token )  // CPA token, granted to affiliate.
                                                  // CPA token and crowdsale token MUST BE owned by this contract!
        Crowdsale(_startTime, _endTime, _rate, _wallet) public {
        token = MintableToken(_token);
        cpa_token = MintableToken(_cpa_token);
    }

     // Method override Crowdsale, as we set token in constructor
    function createTokenContract() internal returns (MintableToken) {
        return MintableToken(address(0));
    }


    // send ether to the fund collection wallet
    // after this, deposit affiliate if needed
    function forwardFunds() internal {    
        super.forwardFunds();
        deposit_affiliate();
    }

    // make affiliate deposit in CPA tokens
    function deposit_affiliate() internal {
        address affiliate = msg.data.toAddress();
        if(affiliate != address(0)){
            cpa_token.mint( affiliate , affiliate_payout( msg.value));
         }
    }

   // this method can be overriden to implement specific affiliate program terms
    function affiliate_payout( uint256 client_value ) internal pure returns (uint256) {
        return client_value;
    }

}