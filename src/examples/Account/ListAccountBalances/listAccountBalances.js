"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const keyword = el('keyword').value;
    listAccountBalances(keyword);
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
}, dcorejs_lib);

function listAccountBalances(accountId) {
    output.innerHTML = 'Loading ...';
    dcore_js.account().listAccountBalances(accountId)
        .then(res => {
            output.innerHTML = '';
            for (let i = 0; i < res.length; i++) {
                const result = res[i];
                output.innerHTML += '<h3>Amount: ' + result.amount + '</h3>';
                output.innerHTML += '<h3>Asset: ' + result.asset_id + '</h3>';
            }
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error loading account balances</p>';
        });
}

//# sourceMappingURL=searchContent.js.map