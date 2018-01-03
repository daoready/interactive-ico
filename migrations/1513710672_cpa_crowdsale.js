var CpaCrowdsaleToken = artifacts.require("examples/CpaCrowdsaleToken");
var CpaBonusToken = artifacts.require("examples/CpaBonusToken");
var CpaCrowdsale = artifacts.require("crowdsale/CpaCrowdsale");

module.exports = function(deployer, network, accounts) {

    var crowdsale, ico_token, cpa_token;

    deployer.deploy(CpaCrowdsaleToken).then(function() {
        return CpaCrowdsaleToken.deployed();
    }).then(function(instance) {
        ico_token = instance;
        return deployer.deploy(CpaBonusToken, ico_token.address);
    }).then(function() {
        return CpaBonusToken.deployed();
    }).then(function(instance) {
        cpa_token = instance;

        var now = Math.floor((new Date()).getTime()/1000);

        var networks = {
            development: {
                crowdsale: {
                    start: now + 1,
                    end: now + 86400*365,
                    rate: 1,
                    wallet: accounts[3]
                }
            },
            ropsten: {
                crowdsale: {
                    start: now + 600,
                    end: now + 86400*365,
                    rate: 1,
                    wallet: accounts[0]
                }
            }

        };

        var config = networks[network];

        return deployer.deploy(CpaCrowdsale,
            config.crowdsale.start, //uint256 _startTime,
            config.crowdsale.end, //uint256 _endTime,
            config.crowdsale.rate, //uint256 _rate,
            config.crowdsale.wallet, //address _wallet,
            ico_token.address, //address _token,
            cpa_token.address //address _cpa_token
        );
    }).then(function() {
        return CpaCrowdsale.deployed();
    }).then(function(instance) {
        crowdsale = instance;
        return cpa_token.transferOwnership(crowdsale.address);
    }).then(function() {
        return ico_token.transferOwnership(crowdsale.address);
    }).then(function() {
        console.log("Deployed CpaCrowdsale at "+crowdsale.address+ " with CPA bonus token at "+cpa_token.address);
    });


};
