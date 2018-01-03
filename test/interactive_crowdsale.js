var Crowdsale = artifacts.require("zeppelin-solidity/contracts/crowdsale/Crowdsale.sol");
var MintableToken = artifacts.require("zeppelin-solidity/contracts/token/MintableToken.sol");

var InteractiveCrowdsale = artifacts.require("crowdsale/InteractiveCrowdsale");
var FuturesToken = artifacts.require("token/FuturesToken");


function delay(t) {
    return new Promise(function(resolve) {
        setTimeout(resolve, t)
    });
}

contract('InteractiveCrowdsale', function (accounts) {

    it("should be deployed", function (done) {

        InteractiveCrowdsale.deployed().then(function (instance) {
            assert.isTrue(!!instance.address);
            return delay(1000);
        }).then( function(){
            done();
        });

    });

    it("should be configured with ICO", function (done) {

        var crowdsale, interactive_crowdsale, token, startTime;

        Crowdsale.deployed().then(function (instance) {
            assert.isTrue(!!instance.address);
            crowdsale = instance;
            return InteractiveCrowdsale.deployed();
        }).then( function (instance) {
            assert.isTrue(!!instance.address);
            interactive_crowdsale = instance;
            return interactive_crowdsale.ico_crowdsale();
        }).then( function (value) {
            assert.equal(value, crowdsale.address);
            return crowdsale.token();
        }).then( function (value) {
            token = value;
            return interactive_crowdsale.ico_token();
        }).then( function (value) {
            assert.equal(value, token);
            return crowdsale.startTime();
        }).then( function (value) {
            startTime = value.toNumber();
            assert.isTrue( new Date(startTime*1000) > new Date() );
            return interactive_crowdsale.endTime();
        }).then( function (value) {
            assert.equal( value.toNumber() , startTime);
            return interactive_crowdsale.wallet();
        }).then( function (instance) {
            assert.equal( instance, interactive_crowdsale.address);
        }).then( function(){
            done();
        });

    });


    it("should own token", function (done) {

        var interactive_crowdsale, token;

        InteractiveCrowdsale.deployed().then(function (instance) {
            assert.isTrue(!!instance.address);
            interactive_crowdsale = instance;
            return interactive_crowdsale.token();
        }).then( function(instance){
            assert.isTrue(!!instance);
            token = FuturesToken.at(instance);
            return token.decimals();
        }).then( function(value){
            assert.equal(value, 18);
            return token.symbol();
        }).then( function(value){
            assert.equal(value, "FUTURE");
            return token.name();
        }).then( function(value){
            assert.equal(value, "Futures Token");
            return token.totalSupply();
        }).then( function(value){
            assert.equal(value, 0);
        }).then( function(){
            done();
        });

    });

    it("should not be finalized", function (done) {

        InteractiveCrowdsale.deployed().then(function (instance) {
            return instance.isFinalized();
        }).then( function(value){
            assert.isFalse(value);
        }).then( function(){
            done();
        });

    });


    it("should have zero ETH balance", function (done) {

        InteractiveCrowdsale.deployed().then(function (instance) {
            return web3.eth.getBalance(instance.address);
        }).then( function(value){
            assert.equal(value, 0);
        }).then( function(){
            done();
        });

    });

        it("should accept ETH in exchange to tokens", function (done) {

            var interactive_crowdsale, token;
            const amt = web3.toWei(0.00005, "ether");
            const purchaser = accounts[0];

            InteractiveCrowdsale.deployed().then(function (instance) {
                interactive_crowdsale = instance;
                return interactive_crowdsale.token();
            }).then( function(instance){
                token = FuturesToken.at(instance);
                return web3.eth.getBalance(interactive_crowdsale.address);
            }).then( function(value){
                assert.equal(value, 0);
                return interactive_crowdsale.sendTransaction({from: purchaser, value: amt});
            }).then( function(result){
                var log = result.logs[0];
                assert.equal(log.event, 'TokenPurchase');
                assert.equal(log.address , interactive_crowdsale.address);
                assert.equal(log.args.value.toNumber() , amt);
                assert.equal(log.args.amount.toNumber() , amt);
                assert.equal(log.args.beneficiary, purchaser);
                assert.equal(log.args.purchaser, purchaser);

                return web3.eth.getBalance(interactive_crowdsale.address);
            }).then( function(value){
                assert.equal(value.toNumber(), amt);
                return token.balanceOf(purchaser);
            }).then( function(value){
                assert.equal(value.toNumber(), amt);
                return token.totalSupply();
            }).then( function(value){
                assert.equal(value.toNumber(), amt);
            }).then( function(){
                done();
            });

        });

        it("should exchange tokens back to ETH before finalization", function (done) {

            var interactive_crowdsale, token, purchaser_balance, gas_price;
            const initial_amt = parseInt(web3.toWei(0.00005, "ether"));
            const amt = parseInt(web3.toWei(0.00001, "ether"));
            const purchaser = accounts[0];
            const gasPrice = web3.eth.gasPrice * 2;

            InteractiveCrowdsale.deployed().then(function (instance) {
                interactive_crowdsale = instance;
                return interactive_crowdsale.token();
            }).then( function(instance){
                token = FuturesToken.at(instance);
                return web3.eth.getBalance(interactive_crowdsale.address);
            }).then( function(value){
                assert.equal(value, initial_amt);
                return web3.eth.getBalance(purchaser);
            }).then( function(value){
                purchaser_balance = parseInt(value);
                return token.balanceOf(purchaser);
            }).then( function(value){
                assert.equal(value, initial_amt);
                return token.transfer(interactive_crowdsale.address, amt, {from: purchaser, gasPrice: gasPrice});
            }).then( function(result){
                var log = result.logs[0];

                assert.equal(log.event, 'Transfer');
                assert.equal(log.address , token.address);
                assert.equal(log.args.value.toNumber() , amt);
                assert.equal(log.args.from, purchaser);
                assert.equal(log.args.to, interactive_crowdsale.address);

                log = result.logs[1];

                assert.equal(log.event, 'Burn');
                assert.equal(log.address , token.address);
                assert.equal(log.args.value.toNumber() , amt);
                assert.equal(log.args.burner, interactive_crowdsale.address);

                gas_price = gasPrice * result.receipt.gasUsed ;
                return web3.eth.getBalance(interactive_crowdsale.address);
            }).then( function(value){
                assert.equal(value, initial_amt - amt);
                return token.balanceOf(purchaser);
            }).then( function(value){
                assert.equal(value, initial_amt - amt);
                return web3.eth.getBalance(interactive_crowdsale.address);
            }).then( function(value){
                assert.equal(value, initial_amt - amt);
                return token.totalSupply();
            }).then( function(value){
                assert.equal(value, initial_amt - amt);
                return web3.eth.getBalance(purchaser);
            }).then( function(value){
                assert.equal(Math.round(value.toNumber()/100000),  Math.round(((purchaser_balance + (amt - gas_price))/100000)));
                done();
            });

        });


        it("should not allow call protected methods", function (done) {

            var interactive_crowdsale, token;
            const purchaser = accounts[0];

            InteractiveCrowdsale.deployed().then(function (instance) {
                interactive_crowdsale = instance;
                return interactive_crowdsale.token();
            }).then( function(instance){
                token = FuturesToken.at(instance);
                return interactive_crowdsale.tokenFallback(purchaser, 1, 0, {from: purchaser, gas: 100000} );
            }).then( function(){
                assert.fail("Exception expected");
            }).catch(function(error) {
                return interactive_crowdsale.ico_crowdsale();
            }).then( function(instance){
                return interactive_crowdsale.setIco(token, instance, {from: purchaser, gas: 100000});
            }).then( function(){
                assert.fail("Exception expected");
            }).catch(function(error) {
                done();
            });

        });

        it("should allow transfer futures tokens between owners", function (done) {

            var interactive_crowdsale, token, balance_before;
            const purchaser = accounts[0];
            const receiver = accounts[1];
            const amt = parseInt(web3.toWei(0.00001, "ether"));

            InteractiveCrowdsale.deployed().then(function (instance) {
                interactive_crowdsale = instance;
                return interactive_crowdsale.token();
            }).then( function(instance){
                token = FuturesToken.at(instance);
                return token.balanceOf(purchaser);
            }).then( function(value){
                balance_before = value;
                assert.isTrue(balance_before>0);
                return token.balanceOf(receiver);
            }).then( function(value){
                assert.equal(value, 0);
                return token.transfer(receiver, amt, {from: purchaser});
            }).then( function(result){
                var log = result.logs[0];

                assert.equal(log.event, 'Transfer');
                assert.equal(log.address , token.address);
                assert.equal(log.args.value.toNumber() , amt);
                assert.equal(log.args.from, purchaser);
                assert.equal(log.args.to, receiver);

                return token.balanceOf(purchaser);
            }).then( function(value){
                assert.equal(value, balance_before-amt);
                return token.balanceOf(receiver);
            }).then( function(value){
                assert.equal(value, amt);
                done();
            });

        });

        it("should not allow transfer futures to other contracts", function (done) {

            var interactive_crowdsale, ico_crowdsale, token;
            const purchaser = accounts[0];
            const amt = parseInt(web3.toWei(0.0000001, "ether"));

            InteractiveCrowdsale.deployed().then(function (instance) {
                interactive_crowdsale = instance;
                return interactive_crowdsale.token();
            }).then( function(instance){
                token = FuturesToken.at(instance);
                return interactive_crowdsale.token();
            }).then( function(instance){
                token = FuturesToken.at(instance);
                return interactive_crowdsale.ico_crowdsale();
            }).then( function(instance){
                return token.transfer(instance, amt, {from: purchaser} );
            }).then( function(){
                assert.fail("Exception expected");
            }).catch(function(error) {
                return token.transfer(token, amt, {from: purchaser} );
            }).then( function(){
                assert.fail("Exception expected");
            }).catch(function(error) {
                done();
            });

        });


        it("should allow finalize", function (done) {

            var interactive_crowdsale, token, ico_crowdsale, ico_token, balance, rate, wallet, wallet_balance;
            const owner = accounts[0];
            const not_owner = accounts[1];

            InteractiveCrowdsale.deployed().then(function (instance) {
                interactive_crowdsale = instance;
                return interactive_crowdsale.ico_crowdsale();
            }).then( function(instance){
                ico_crowdsale = Crowdsale.at(instance);
                return ico_crowdsale.rate();
            }).then( function(value){
                rate = value.toNumber();
                return ico_crowdsale.token();
            }).then( function(instance){
                ico_token = MintableToken.at(instance);
                return ico_crowdsale.wallet();
            }).then( function(instance){
                wallet = instance;
                return web3.eth.getBalance(wallet);
            }).then( function(value){
                wallet_balance = value.toNumber();
                return web3.eth.getBalance(interactive_crowdsale.address);
            }).then( function(value){
                balance = value.toNumber();
                assert.isTrue(value.toNumber()>0);
                return interactive_crowdsale.token();
            }).then( function(instance){
                token = FuturesToken.at(instance);
                return token.totalSupply();
            }).then( function(value){
                assert.equal(value, balance);
                return delay(10000);
            }).then( function(){
                return interactive_crowdsale.isFinalized();
            }).then( function(value){
                assert.isFalse(value);
                return interactive_crowdsale.hasEnded();
            }).then( function(value){
                assert.isTrue(value);
                return interactive_crowdsale.owner();
            }).then( function(value){
                assert.equal(instance, owner);
                return web3.eth.sendTransaction({from: owner, to: not_owner, value: amt});
            }).then( function(result){
                return interactive_crowdsale.finalize({from: not_owner, gas: 550000});
            }).then( function(){
                assert.fail("Exception expected");
            }).catch(function(error) {
                return interactive_crowdsale.finalize({from: owner, gas: 550000});
            }).then( function(result){

                var log = result.logs[0];
                assert.equal(log.event, 'TokenPurchase');
                assert.equal(log.address , ico_crowdsale.address);
                assert.equal(log.args.value.toNumber() , balance);
                assert.equal(log.args.amount.toNumber() , balance*rate);
                assert.equal(log.args.beneficiary, interactive_crowdsale.address);
                assert.equal(log.args.purchaser, interactive_crowdsale.address);

                var log = result.logs[1];
                assert.equal(log.event, 'Finalized');
                assert.equal(log.address , interactive_crowdsale.address);

                return interactive_crowdsale.isFinalized();
            }).then( function(value){
                assert.isTrue(value);
                return web3.eth.getBalance(interactive_crowdsale.address);
            }).then( function(value){
                assert.equal(0, value.toNumber());
                return web3.eth.getBalance(wallet);
            }).then( function(value){
                assert.equal(wallet_balance + balance, value.toNumber());
                return ico_token.totalSupply();
            }).then( function(value){
                assert.equal(balance*rate, value);
                return ico_token.balanceOf(interactive_crowdsale.address);
            }).then( function(value){
                assert.equal(balance*rate, value);
                done();
            });

        });

        it("should not allow transfer ETH after finalization", function (done) {

            var interactive_crowdsale;
            const purchaser = accounts[0];
            const amt = parseInt(web3.toWei(0.0000001, "ether"));

            InteractiveCrowdsale.deployed().then(function (instance) {
                interactive_crowdsale = instance;
                return interactive_crowdsale.isFinalised();
            }).then( function(value){
                assert.isTrue(value);
                return interactive_crowdsale.sendTransaction({from: purchaser, value: amt});
            }).then( function(){
                assert.fail("Exception expected");
            }).catch(function(error) {
                done();
            });

        });


        it("should exchange tokens back to ICO tokens after finalization", function (done) {

            var interactive_crowdsale, ico_crowdsale, rate, token, ico_token, balance;
            const amt = parseInt(web3.toWei(0.000001, "ether"));
            const purchaser = accounts[0];

            InteractiveCrowdsale.deployed().then(function (instance) {
                interactive_crowdsale = instance;
                return interactive_crowdsale.token();
            }).then( function(instance){
                token = FuturesToken.at(instance);
                return interactive_crowdsale.isFinalized();
            }).then( function(value){
                assert.isTrue(value);
                return interactive_crowdsale.ico_crowdsale();
            }).then( function(instance){
                ico_crowdsale = Crowdsale.at(instance);
                return ico_crowdsale.rate();
            }).then( function(value){
                rate = value.toNumber();
                assert.isTrue(rate>0);
                return interactive_crowdsale.ico_token();
            }).then( function(instance){
                ico_token = MintableToken.at(instance);
                return ico_token.balanceOf(purchaser);
            }).then( function(value){
                assert.equal(value, 0);
                return token.balanceOf(purchaser);
            }).then( function(value){
                assert.isTrue(value > 0);
                balance = value;
                return token.transfer(interactive_crowdsale.address, amt, {from: purchaser, gas: 150000});
            }).then( function(result){

                var log = result.logs[0];

                assert.equal(log.event, 'Transfer');
                assert.equal(log.address , token.address);
                assert.equal(log.args.value.toNumber() , amt);
                assert.equal(log.args.from, purchaser);
                assert.equal(log.args.to, interactive_crowdsale.address);

                log = result.logs[1];

                assert.equal(log.event, 'Transfer');
                assert.equal(log.address , ico_token.address);
                assert.equal(log.args.value.toNumber() , amt*rate);
                assert.equal(log.args.from, interactive_crowdsale.address);
                assert.equal(log.args.to, purchaser);

                log = result.logs[2];

                assert.equal(log.event, 'Burn');
                assert.equal(log.address , token.address);
                assert.equal(log.args.value.toNumber() , amt);
                assert.equal(log.args.burner, interactive_crowdsale.address);

                return ico_token.balanceOf(purchaser);
            }).then( function(value){
                assert.equal(amt*rate, value);
                return token.balanceOf(purchaser);
            }).then( function(value){
                assert.equal(balance - amt, value);

                done();
            });

        });


        it("should allow exchange to ICO token", function (done) {

            var interactive_crowdsale, ico_crowdsale, rate, token, ico_token, balance, token_balance;
            const purchaser = accounts[0];

            InteractiveCrowdsale.deployed().then(function (instance) {
                interactive_crowdsale = instance;
                return interactive_crowdsale.token();
            }).then( function(instance){
                token = FuturesToken.at(instance);
                return interactive_crowdsale.isFinalized();
            }).then( function(value){
                assert.isTrue(value);
                return interactive_crowdsale.ico_crowdsale();
            }).then( function(instance){
                ico_crowdsale = Crowdsale.at(instance);
                return ico_crowdsale.rate();
            }).then( function(value){
                rate = value.toNumber();
                assert.isTrue(rate>0);
                return interactive_crowdsale.ico_token();
            }).then( function(instance){
                ico_token = MintableToken.at(instance);
                return ico_token.balanceOf(purchaser);
            }).then( function(value){
                token_balance = value;
                return token.balanceOf(purchaser);
            }).then( function(value){
                balance = value.toNumber();
                assert.isTrue(value > 0);
                return ico_token.balanceOf(interactive_crowdsale.address);
            }).then( function(value){
                return token.transfer(interactive_crowdsale.address, balance+1, {from: purchaser, gas: 150000});
            }).then( function(){
                assert.fail("Exception expected");
            }).catch(function(error) {

                return token.transfer(interactive_crowdsale.address, balance, {from: purchaser, gas: 150000});
            }).then( function(result){

                var log = result.logs[0];

                assert.equal(log.event, 'Transfer');
                assert.equal(log.address , token.address);
                assert.equal(log.args.value.toNumber() , balance);
                assert.equal(log.args.from, purchaser);
                assert.equal(log.args.to, interactive_crowdsale.address);

                log = result.logs[1];

                assert.equal(log.event, 'Transfer');
                assert.equal(log.address , ico_token.address);
                assert.equal(log.args.value.toNumber() , balance*rate);
                assert.equal(log.args.from, interactive_crowdsale.address);
                assert.equal(log.args.to, purchaser);

                log = result.logs[2];

                assert.equal(log.event, 'Burn');
                assert.equal(log.address , token.address);
                assert.equal(log.args.value.toNumber() , balance);
                assert.equal(log.args.burner, interactive_crowdsale.address);

                return ico_token.balanceOf(purchaser);
            }).then( function(value){
                assert.equal(parseInt(token_balance) + parseInt(balance)*rate, value.toNumber());
                return token.balanceOf(purchaser);
            }).then( function(value){
                assert.equal(0, value);
                done();
            });

        });



        it("should allow exchange all tokens", function (done) {

            var interactive_crowdsale, balance, token, ico_token, rate;
            const purchaser = accounts[1];

            InteractiveCrowdsale.deployed().then(function (instance) {
                interactive_crowdsale = instance;
                return interactive_crowdsale.token();
            }).then( function(instance){
                token = FuturesToken.at(instance);
                return token.balanceOf(purchaser);
            }).then( function(value){
                balance = parseInt(value);
                assert.isTrue(balance>0);
                return interactive_crowdsale.ico_crowdsale();
            }).then( function(instance){
                ico_crowdsale = Crowdsale.at(instance);
                return ico_crowdsale.rate();
            }).then( function(value){
                rate = value.toNumber();
                return interactive_crowdsale.ico_token();
            }).then( function(instance){
                ico_token = MintableToken.at(instance);
                return token.transfer(interactive_crowdsale.address, balance, {from: purchaser, gas: 150000});
            }).then( function(result){
                return ico_token.balanceOf(purchaser);
            }).then( function(value){
                assert.equal(balance*rate, value.toNumber());
                return token.balanceOf(purchaser);
            }).then( function(value){
                assert.equal(0, value);
                return token.totalSupply();
            }).then( function(value){
                assert.equal(0, value);
                return ico_token.balanceOf(interactive_crowdsale.address);
            }).then( function(value){
                assert.equal(0, value);
                done();
            });

        });
});
