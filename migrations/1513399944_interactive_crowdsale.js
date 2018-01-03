
var Crowdsale = artifacts.require("zeppelin-solidity/contracts/сrowdsale/Crowdsale.sol");
var FuturesToken = artifacts.require("token/FuturesToken");
var InteractiveCrowdsale = artifacts.require("сrowdsale/InteractiveCrowdsale");


module.exports = function(deployer, network, accounts) {


    var now = Math.floor((new Date()).getTime()/1000);

    var networks = {
        development: {
            crowdsale: {
                start: now + 10,
                end: now + 86400,
                rate: 10,
                wallet: accounts[3]
            },
            interactive_crowdsale: {
                start: now + 1,
                end: now + 10
            }
        },
        ropsten: {
            crowdsale: {
                start: now + 86400*180,
                end: now + 86400*240,
                rate: 100,
                wallet: accounts[0]
            },
            interactive_crowdsale: {
                start: now + 600,
                end: now + 86400*180
            }
        }

    };

    var config = networks[network];

    var ico, token, futures_token, interactive_ico;


    deployer.deploy(Crowdsale,
            config.crowdsale.start,       //uint256 _startTime,
            config.crowdsale.end,         //uint256 _endTime,
            config.crowdsale.rate,        //uint256 _rate,
            config.crowdsale.wallet       //address _wallet
     ).then(function() {
        return Crowdsale.deployed();
    }).then(function(instance) {
        ico = instance;
        return ico.token();
    }).then(function(instance) {
        token = instance;
        console.log("Deployed Crowdsale at " + ico.address + " with token at " + token);
        return deployer.deploy(FuturesToken, "Futures Token", "FUTURE");
    }).then(function() {
        return FuturesToken.deployed();
    }).then(function(instance) {
        futures_token = instance;
        console.log("Deployed FuturesToken at " + futures_token.address);

        return deployer.deploy(InteractiveCrowdsale,
            token,          // address _ico_token,
            ico.address,    // address _ico_crowdsale,
            futures_token.address, // address _futures_token,
            config.interactive_crowdsale.start,             // uint256 _startTime,
            config.interactive_crowdsale.end               // uint256 _endTime,
        );
    }).then(function() {
        return InteractiveCrowdsale.deployed();
    }).then(function(instance) {
        interactive_ico = instance;
    }).then(function() {
        return futures_token.transferOwnership(interactive_ico.address);
    }).then(function() {
        console.log("Deployed InteractiveCrowdsale at "+interactive_ico.address+ " with token at "+futures_token.address);
    });

};
