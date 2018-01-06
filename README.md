# Interactive ICO Smart Contract

Interactive ICO (I2CO) allows participants to withdraw funds before it finishes.
Read more in [Interactive coin offerings](https://people.cs.uchicago.edu/~teutsch/papers/ico.pdf)
article by Jason Teutsch,  Vitalik Buterin and Christopher Brown.

This repository contains set of Solidity smart contracts to run I2CO on your project. 
These contracts extend capabilities of your ICO and raising the chances for your ICO success.

I2CO smart contracts are bases on [Open Zeppelin](https://github.com/OpenZeppelin/zeppelin-solidity)
framework, tested with [Truffle](http://truffleframework.com/) framework. They are production-ready
and can be easily adopted to any ICO mechanics on Ethereum.

## Smart Contracts

### InteractiveCrowdsale

InteractiveCrowdsale is a contract between potential pariticipants of the token ICO crowdsale.
It is used on pre-ICO or early stages of ICO to gather prelimiary amount of ether and
collect information about wishing participants in ICO.

InteractiveCrowdsale issues "futures" tokens in exchange to ether, being paid on this contract
in 1:1 proportion. 1 ether = 1 Future token. Future tokens can be exhanged back to ether or to
ICO crowdsale tokens, depending on the phase of ICO.

InteractiveCrowdsale is finalised on the start date of ICO crowdsale. Before finalization,
participants buy future tokens. Future tokens can be sent back to this contract, and
contract sneds them back the same amount of ether. It allows participants to reserve the
ether for participating in specific ICO, having information about other participants.
Ability to withdraw amount in any time before finalization is ensured by the smart contract and
the standard ERC20 'futures' token.

On finalisation, InteractiveCrowdsale transfers all collected money to ICO crowdsale contract
and get the ICO tokens back, proportional to the invested amount. The rate of this conversion is up
to ICO crowdsale contract, and typically determined by 'rate' or 'price' parameter.

After finalisation, Futures tokens can be exchange to the ICO tokens, proportional to the amount invested
multiply the rate of conversion ether -> ICO token. Owner transfers tokens to InteractiveCrowdsale contract
and receive ICO tokens back.

Participants of InteractiveCrowdsale can use regular ethereum wallet, capable to store and transfer ERC 20 tokens
to perform all operations (such as myetherwallet), no special Dapps are required.

InteractiveCrowdsale can work with a wide variety of crowdsale contracts with a minimum requirements:
1) ICO must use standard ERC20 token
2) ICO should exchange ether to ERC20 at time of finalisation.

The presence of ICO token and contract is required only at time of finalisation. Before finalization
they are optional.

### CPACrowdsale

CPACrowdsale is a demonstration of how decentralized reward protocol can be used with CPA offers.
The [demo page](http://daoready.com/product/cpa-ico?aff=0x28698ed7e540B437D5D43bB7cc1a4C76a4Ab571C) shows how this
contract can be used to track and reward traffic on ICO sale page.

## Trial on Ropsten Network

Interactive ICO is deployed on Ropsten network on address: [0x7189e32b9b48fc31727faca0b7538e4bda9905e8](https://ropsten.etherscan.io/address/0x7189e32b9b48fc31727faca0b7538e4bda9905e8)
You can try send Ropsten ether to it and get back Futures tokens 
[0x900e754536b7aa2e4d37e02f4d04d170cb9c78fe](https://ropsten.etherscan.io/token/0x900e754536b7aa2e4d37e02f4d04d170cb9c78fe)
ee2c44dd2c1ecca4).

Finalized contract deployed on address: [0xf78764a9a8694ae96833035b4a1d8b02e2ac5fee](https://ropsten.etherscan.io/address/0xf78764a9a8694ae96833035b4a1d8b02e2ac5fee)
with token [0xeb21473f14ed722f1e0e4477680dfae53a419d4e](https://ropsten.etherscan.io/token/0xeb21473f14ed722f1e0e4477680dfae53a419d4e)

CPACrowdsale deployed on [0x87c3e1587daf167e0aac99b8432df8578e307775](https://ropsten.etherscan.io/address/0x87c3e1587daf167e0aac99b8432df8578e307775).


## Learning More

Please visit [DAOReady.com](http://daoready.com) Web site for more information on this smart contract functionality, use case, enhancements and more!

## Information For Developers

### Running tests

Development environment, defined in truffle.js, uses local server.
To test locally, you can use [TestRPC](https://github.com/pipermerriam/eth-testrpc) or
[Ganache](https://github.com/trufflesuite/ganache-cli):

```
npm install -g ganache-cli
ganache-cli
```
After server started, you can compile, run migrations and tests:

```
truffle compile
truffle migrate
truffle test
```


### Validating contract sources

[solidity_flattener](https://github.com/BlockCatIO/solidity-flattener) used to generate sources for validation.
Generated sources are in build/src folder, with suffix _flat.sol. They are generated using the following commands:

Note, that the unsupported parameter --allow-paths required, Before it is integrated into release of solidity_flattener,
use the installation from branch:
```
pip3 install git+https://github.com/dostu/solidity-flattener.git
```

Then execute commands how to build flat sources:

```
solidity_flattener --solc-paths="zeppelin-solidity/=$(pwd)/node_modules/zeppelin-solidity/" --output build/src/Crowdsale_flat.sol $(pwd)/node_modules/zeppelin-solidity/contracts/crowdsale/Crowdsale.sol
solidity_flattener --solc-paths="zeppelin-solidity/=$(pwd)/node_modules/zeppelin-solidity/" --output build/src/MintableToken_flat.sol $(pwd)/node_modules/zeppelin-solidity/contracts/token/MintableToken.sol

solidity_flattener --solc-paths="zeppelin-solidity/=$(pwd)/node_modules/zeppelin-solidity/" --output build/src/FuturesToken_flat.sol contracts/token/FuturesToken.sol

solidity_flattener --solc-paths="zeppelin-solidity/=$(pwd)/node_modules/zeppelin-solidity/" --allow-paths "$(pwd)/contracts" --output build/src/InteractiveCrowdsale_flat.sol contracts/crowdsale/InteractiveCrowdsale.sol
solidity_flattener --solc-paths="zeppelin-solidity/=$(pwd)/node_modules/zeppelin-solidity/" --allow-paths "$(pwd)/contracts" --output build/src/CpaCrowdsale_flat.sol contracts/crowdsale/CpaCrowdsale.sol

solidity_flattener --solc-paths="zeppelin-solidity/=$(pwd)/node_modules/zeppelin-solidity/" --allow-paths "$(pwd)/contracts" --output build/src/CrowdsaleToken_flat.sol contracts/examples/CrowdsaleToken.sol
solidity_flattener --solc-paths="zeppelin-solidity/=$(pwd)/node_modules/zeppelin-solidity/" --allow-paths "$(pwd)/contracts" --output build/src/CpaBonusToken_flat.sol contracts/examples/CpaBonusToken.sol
solidity_flattener --solc-paths="zeppelin-solidity/=$(pwd)/node_modules/zeppelin-solidity/" --allow-paths "$(pwd)/contracts" --output build/src/CpaCrowdsaleToken_flat.sol contracts/examples/CpaCrowdsaleToken.sol
solidity_flattener --solc-paths="zeppelin-solidity/=$(pwd)/node_modules/zeppelin-solidity/" --allow-paths "$(pwd)/contracts" --output build/src/CrowdsaleBonusToken_flat.sol contracts/examples/CrowdsaleBonusToken.sol
solidity_flattener --solc-paths="zeppelin-solidity/=$(pwd)/node_modules/zeppelin-solidity/" --allow-paths "$(pwd)/contracts" --output build/src/CrowdsaleToken_flat.sol contracts/examples/CrowdsaleToken.sol

```


## License
Code released under the [MIT License](https://github.com/OpenZeppelin/zeppelin-solidity/blob/master/LICENSE).
