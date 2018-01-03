pragma solidity ^0.4.18;

import '../token/FuturesToken.sol';

import 'zeppelin-solidity/contracts/crowdsale/FinalizableCrowdsale.sol';
import 'zeppelin-solidity/contracts/token/ERC20Basic.sol';

/**
 * @title InteractiveCrowdsale
 * @dev InteractiveCrowdsale allows to withdraw money invested in ICO prior to finalization date.
 * @author DAO Ready <info@daoready.com>
 *
 * InteractiveCrowdsale is a contract between potential pariticipants of the token ICO crowdsale.
 * It is used on pre-ICO or early stages of ICO to gather prelimiary amount of ether and
 * collect information about wishing participants in ICO.
 *
 * InteractiveCrowdsale issues "futures" tokens in exchange to ether, being paid on this contract
 * in 1:1 proportion. 1 ether = 1 Future token. Future tokens can be exhanged back to ether or to
 * ICO crowdsale tokens, depending on the phase of ICO.
 *
 * InteractiveCrowdsale is finalised on the start date of ICO crowdsale. Before finalization,
 * participants buy future tokens. Future tokens can be sent back to this contract, and
 * contract sneds them back the same amount of ether. It allows participants to reserve the
 * ether for participating in specific ICO, having information about other participants.
 * Ability to withdraw amount in any time before finalization is ensured by the smart contract and
 * the standard ERC20 'futures' token.
 *
 * On finalisation, InteractiveCrowdsale transfers all collected money to ICO crowdsale contract
 * and get the ICO tokens back, proportional to the invested amount. The rate of this conversion is up
 * to ICO crowdsale contract, and typically determined by 'rate' or 'price' parameter.
 *
 * After finalisation, Futures tokens can be exchange to the ICO tokens, proportional to the amount invested
 * multiply the rate of conversion ether -> ICO token. Owner transfers tokens to InteractiveCrowdsale contract
 * and receive ICO tokens back.
 *
 * Participants of InteractiveCrowdsale can use regular ethereum wallet, capable to store and transfer ERC 20 tokens
 * to perform all operations (such as myetherwallet), no special Dapps are required.
 *
 * InteractiveCrowdsale can work with a wide variety of crowdsale contracts with a minimum requirements:
 * 1) ICO must use standard ERC20 token
 * 2) ICO should exchange ether to ERC20 at time of finalisation.
 *
 * The presence of ICO token and contract is required only at time of finalisation. Before finalization
 * they are optional.
 *
 * InteractiveCrowdsale inspired from the white paper: https://people.cs.uchicago.edu/~teutsch/papers/ico.pdf
 * 'Interactive coin offerings' (Jason Teutsch,  Vitalik Buterin, Christopher Brown ).
 *
 */
contract InteractiveCrowdsale is Crowdsale, FinalizableCrowdsale, ERC223ReceivingContract {

  // Token of ICO crowdsale
  ERC20Basic    public  ico_token;

  // ICO crowdsale contract, exchanging ether to tokens
  address       public  ico_crowdsale;

  function InteractiveCrowdsale(
                address _ico_token,         // Token of ICO crowdsale, can be set to address(0) if unknown at time of start
                address _ico_crowdsale,     // Contract of ICO crowdsale, can be set to address(0) if unknown at time of start
                FuturesToken _futures_token,// Futures token, issued to InteractiveCrowdsale participants in exchange to ether invested
                                            // Futures token MUST BE owned by this contract!  This can be done by calling transferOwnership()
                                            // after the InteractiveCrowdsale contract is created
                uint256 _startTime,         // Start time of InteractiveCrowdsale
                uint256 _endTime)           // End time of InteractiveCrowdsale
       Crowdsale(_startTime, _endTime, 1, this) public {

       ico_token = ERC20Basic(_ico_token);
       ico_crowdsale = _ico_crowdsale;

       token = _futures_token;

  }

  // Method override Crowdsale, as we set token in constructor
  function createTokenContract() internal returns (MintableToken) {
    return MintableToken(address(0));
  }


  // Method override ERC223ReceivingContract
  // Before finalization, the contract receives Futures tokens, and sends corresponding ether amount in 1:1 proportion
  // After finalization, the contract receives Futures tokens, and sends corresponding ICO tokens amount in proportion,
  // determined by the crowdsale
    function tokenFallback(address _from, uint _value, bytes ) public {
    require( msg.sender == address(token) );
    require( _value > 0 );

    if(isFinalized){
        uint256 tokens =  _value.mul(ico_token.balanceOf(this)) / token.totalSupply();
        ico_token.transfer(_from, tokens);
    }else{
        require(_from.call.value(_value)());
    }

    FuturesToken(token).burn(_value);

  }

  // override from Crowdsale to keep all funds collected on this contract
  function forwardFunds() internal {
  }

  // Futures tokens can be bought only before InteractiveCrowdsale is finalized
  function validPurchase() internal view returns (bool) {
    return super.validPurchase() && !isFinalized;
  }


  // The method must be called after ico crowdsale is started and capable to
  // exchange tokens to ether.
  function finalization() internal {

    require(ico_crowdsale != address(0));
    require(ico_token != ERC20Basic(address(0)));

    if(token.totalSupply()>0){
       require(ico_crowdsale.call.value(token.totalSupply())());
    }

    super.finalization();
  }

  // Method to set or change ICO contract and token
  function setIco(address _ico_token, address _ico_crowdsale)  onlyOwner public {
    require(address(_ico_token) != address(0));
    require(_ico_crowdsale != address(0));

    ico_token = ERC20Basic(_ico_token);
    ico_crowdsale = _ico_crowdsale;
  }


}
