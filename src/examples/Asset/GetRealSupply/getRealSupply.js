"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    getRealSupply();
};
const output = el('output');

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, false);

function getRealSupply() {
    output.innerHTML = 'Loading ...';
    dcore_js.asset().getRealSupply()
        .then(result => {
            output.innerHTML = '';
            output.innerHTML += '<h3>Account balances: ' + result.account_balances + '</h3>';
            output.innerHTML += '<h3>Vesting balances: ' + result.vesting_balances + '</h3>';
            output.innerHTML += '<h3>Escrows: ' + result.escrows + '</h3>';
            output.innerHTML += '<h3>Pools: ' + result.pools + '</h3>';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error getting real supply</p>';
        });
}

//# sourceMappingURL=searchContent.js.map
