var CrowdsaleToken = artifacts.require("examples/CrowdsaleToken");
var CrowdsaleBonusToken = artifacts.require("examples/CrowdsaleBonusToken");

module.exports = function(deployer) {

    var token, bonus_token;

    deployer.deploy(CrowdsaleToken).then(function() {
        return CrowdsaleToken.deployed();
    }).then(function(instance) {
        token = instance;

        return deployer.deploy(CrowdsaleBonusToken,
            token.address // address _ico_token
        );

    }).then(function() {
        return CrowdsaleBonusToken.deployed();
    }).then(function(instance) {
        bonus_token = instance;
        console.log("Deployed CrowdsaleBonusToken at "+bonus_token.address+ " with ico token at "+token.address);
    });



};
