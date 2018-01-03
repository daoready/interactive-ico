pragma solidity ^0.4.18;

import 'zeppelin-solidity/contracts/token/StandardToken.sol';

// ERC233 token https://github.com/Dexaran/ERC223-token-standard
contract ERC223ReceivingContract {
    function tokenFallback(address _from, uint _value, bytes _data) public;
}

contract ERC233Token is StandardToken {

  /**
  * @dev transfer token for a specified address
  * @param _to The address to transfer to.
  * @param _value The amount to be transferred.
  */
  function transfer(address _to, uint256 _value) public returns (bool) {

    require(super.transfer(_to, _value));

    if(isContract(_to)){
        bytes memory empty;
        ERC223ReceivingContract receiver = ERC223ReceivingContract(_to);
        receiver.tokenFallback(msg.sender, _value, empty);
    }

    return true;
  }

  /**
   * @dev Transfer tokens from one address to another
   * @param _from address The address which you want to send tokens from
   * @param _to address The address which you want to transfer to
   * @param _value uint256 the amount of tokens to be transferred
   */
  function transferFrom(address _from, address _to, uint256 _value) public returns (bool) {

      require(super.transferFrom(_from, _to, _value));

      if(isContract(_to)){
          bytes memory empty;
          ERC223ReceivingContract receiver = ERC223ReceivingContract(_to);
          receiver.tokenFallback( _from, _value, empty);
      }

      return true;

  }

  /**
   * @dev Internal function to determine if an address is a contract
   * @param _addr The address being queried
   * @return True if `_addr` is a contract
   */
  function isContract(address _addr) constant internal returns(bool) {
      uint size;
      if (_addr == 0) return false;
      assembly {
        size := extcodesize(_addr)
      }
      return size>0;
  }

}