pragma solidity ^0.4.18;

/**
 * @title StringUtils
 * @dev Assorted string operations
 */

library StringUtils {

  // convert string to address
  function toAddress(bytes b) internal pure returns (address) {
      uint result = 0;
      for(uint8 i = 0; i < b.length; i++){
        result = result*256 + uint160(b[i]);
      }
      return address(result);
  }


}
