var HDWalletProvider = require("truffle-hdwallet-provider");
var prompt = require('prompt-sync')();

var mnemonic;

module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!

    networks: {
        development: {
            host: "localhost",
            port: 8545,
            network_id: "*" // Match any network id
        },
        ropsten: {
            provider: function() {
                if(!mnemonic)
                     mnemonic = prompt('Enter mnemonic for ROPSTEN network:');
                return new HDWalletProvider(mnemonic, "https://ropsten.infura.io/");
            },
            network_id: '3',
            gas: 4700000
        }
    },
    solc: {
        optimizer: {
            enabled: true,
            runs: 200
        }
    }
};
