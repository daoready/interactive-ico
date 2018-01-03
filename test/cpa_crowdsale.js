var MintableBonusToken = artifacts.require("examples/CpaBonusToken");
var MintableToken = artifacts.require("examples/CpaCrowdsaleToken");
var CpaCrowdsale = artifacts.require("crowdsale/CpaCrowdsale");

function delay(t) {
    return new Promise(function(resolve) {
        setTimeout(resolve, t)
    });
}

contract('CpaCrowdsale', function(accounts) {

    it("should be deployed", function (done) {

        CpaCrowdsale.deployed().then(function (instance) {
            assert.isTrue(!!instance.address);
        }).then( function(){
            return delay(1000);
        }).then( function(){
            done();
        });

    });


    it("should own tokens", function (done) {

        var crowdsale;

        CpaCrowdsale.deployed().then(function (instance) {
            crowdsale = instance;
            return crowdsale.token();
        }).then( function(instance){
            assert.isTrue(!!instance);
            return crowdsale.cpa_token();
        }).then( function(instance){
            assert.isTrue(!!instance);
            done();
        });

    });

    it("should sell tokens", function (done) {

        var crowdsale, token;
        const purchaser = accounts[0];
        const amt = web3.toWei(0.00005, "ether");

        CpaCrowdsale.deployed().then(function (instance) {
            crowdsale = instance;
            return crowdsale.token();
        }).then( function(instance){
            token = MintableToken.at(instance);
            return token.balanceOf(purchaser);
        }).then( function(value){
            assert.equal(0, value.toNumber());
            return crowdsale.sendTransaction({from: purchaser, value: amt, gas: 150000});
        }).then( function(result){
            var log = result.logs[0];

            assert.equal(log.event, 'TokenPurchase');
            assert.equal(log.address , crowdsale.address);
            assert.equal(log.args.value.toNumber() , amt);
            assert.equal(log.args.amount.toNumber() , amt);
            assert.equal(log.args.beneficiary, purchaser);
            assert.equal(log.args.purchaser, purchaser);

            return token.balanceOf(purchaser);
        }).then( function(value){
            assert.equal(value, amt);
            return token.totalSupply();
        }).then( function(value){
            assert.equal(value, amt);
            done();
        });

    });

    it("should grant bonus tokens to affiliate", function (done) {

        var crowdsale, token, token_balance, cpa_token, cpa_token_balance;
        const purchaser = accounts[0];
        const affiliate = accounts[4];

        const amt = web3.toWei(0.00006, "ether");

        CpaCrowdsale.deployed().then(function (instance) {
            crowdsale = instance;
            return crowdsale.token();
        }).then( function(instance){
            token = MintableToken.at(instance);
            return token.balanceOf(purchaser);
        }).then( function(value){
            token_balance = value.toNumber();
            return crowdsale.cpa_token();
        }).then( function(instance){
            cpa_token = MintableBonusToken.at(instance);
            return cpa_token.balanceOf(affiliate);
        }).then( function(value){
            cpa_token_balance = value.toNumber();
            return crowdsale.sendTransaction({from: purchaser, value: amt, gas: 150000, data: affiliate});
        }).then( function(result){
            return token.totalSupply();
        }).then( function(value){
            assert.equal(value.toNumber(), parseInt(amt) + parseInt(token_balance));
            return cpa_token.balanceOf(affiliate);
        }).then( function(value){
            assert.equal(value.toNumber(), cpa_token_balance + amt);
            done();
        });

    });

});
