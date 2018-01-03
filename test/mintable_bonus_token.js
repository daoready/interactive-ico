
var MintableToken = artifacts.require("examples/CrowdsaleToken");
var MintableBonusToken = artifacts.require("examples/CrowdsaleBonusToken");

contract('MintableBonusToken', function(accounts) {

    it("should be deployed", function (done) {

        MintableBonusToken.deployed().then(function (instance) {
            assert.isTrue(!!instance.address);
        }).then( function(){
            done();
        });

    });


    it("should own token", function (done) {

        var bonus_token, token;

        MintableBonusToken.deployed().then(function (instance) {
            bonus_token = instance;
            return bonus_token.ico_token();
        }).then( function(instance){
            token = MintableToken.at(instance);
            return MintableToken.deployed();
        }).then( function(instance){
            assert.equal(instance.address, token.address);
            done();
        });

    });

    it("should have initial zero supply", function (done) {

        MintableBonusToken.deployed().then(function (instance) {
            return instance.totalSupply();
        }).then( function(value){
            assert.equal(value.toNumber(), 0);
            done();
        });

    });


    it("should give bonuses as tokens", function (done) {

        var owner, bonus_token;
        var bountee = accounts[3];
        var amt = 10;

        MintableBonusToken.deployed().then(function (instance) {
            bonus_token = instance;
            return instance.owner();
        }).then( function(instance){
            owner = instance;
            return bonus_token.mint(bountee, amt, {from: owner});
        }).then( function(result){
            var log = result.logs[0];
            assert.equal(log.event, 'Mint');
            assert.equal(log.address , bonus_token.address);
            assert.equal(log.args.amount.toNumber() , amt);
            assert.equal(log.args.to, bountee);


            log = result.logs[1];
            assert.equal(log.event, 'Transfer');
            assert.equal(log.address , bonus_token.address);
            assert.equal(log.args.value.toNumber() , amt);
            assert.equal(log.args.from, '0x0000000000000000000000000000000000000000');
            assert.equal(log.args.to, bountee);

            return bonus_token.balanceOf(bountee);
        }).then( function(value){
            assert.equal(amt, value);
            return bonus_token.totalSupply();
        }).then( function(value){
            assert.equal(amt, value);
            done();
        });

    });

    it("should give ico tokens as bonuses if possible", function (done) {

        var owner, bonus_token, token;
        var bountee = accounts[4];
        var amt = 10;

        MintableBonusToken.deployed().then(function (instance) {
            bonus_token = instance;
            return instance.owner();
        }).then( function(instance){
            owner = instance;
            return bonus_token.ico_token();
        }).then( function(instance){
            token = MintableToken.at(instance);
            return token.mint(bonus_token.address, amt, {from: owner});
        }).then( function(result){
            return token.balanceOf(bonus_token.address);
        }).then( function(value){
            assert.equal(amt, value.toNumber());
            return bonus_token.mint(bountee, amt, {from: owner, gas: 150000});
        }).then( function(result){
            var log = result.logs[0];
            assert.equal(log.event, 'Transfer');
            assert.equal(log.address , token.address);
            assert.equal(log.args.value.toNumber() , amt);
            assert.equal(log.args.from, bonus_token.address);
            assert.equal(log.args.to, bountee);

            return bonus_token.balanceOf(bountee);
        }).then( function(value){
            assert.equal(0, value.toNumber());
            return token.balanceOf(bountee);
        }).then( function(value){
            assert.equal(amt, value);
            done();
        });

    });

    it("should exchange bonus tokens to ico tokens if possible", function (done) {

        var owner, bonus_token, token;
        var bountee = accounts[3];
        var amt = 10;

        MintableBonusToken.deployed().then(function (instance) {
            bonus_token = instance;
            return instance.owner();
        }).then( function(instance){
            owner = instance;
            return bonus_token.ico_token();
        }).then( function(instance){
            token = MintableToken.at(instance);
            return token.mint(bonus_token.address, amt, {from: owner});
        }).then( function(result){
            return token.balanceOf(bonus_token.address);
        }).then( function(value){
            assert.equal(amt, value.toNumber());
            return bonus_token.transfer(bonus_token.address, amt, {from: bountee, gas: 150000});
        }).then( function(result){
            var log = result.logs[0];
            assert.equal(log.event, 'Transfer');
            assert.equal(log.address , token.address);
            assert.equal(log.args.value.toNumber() , amt);
            assert.equal(log.args.from, bonus_token.address);
            assert.equal(log.args.to, bountee);

            log = result.logs[1];
            assert.equal(log.event, 'Burn');
            assert.equal(log.address , bonus_token.address);
            assert.equal(log.args.value.toNumber() , amt);
            assert.equal(log.args.burner, bountee);

            return bonus_token.balanceOf(bountee);
        }).then( function(value){
            assert.equal(0, value.toNumber());
            return token.balanceOf(bountee);
        }).then( function(value){
            assert.equal(amt, value);
            done();
        });

    });

});
