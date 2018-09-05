"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const symbol = el('symbol').value;
    const amount = el('amount').value;
    const toAccount = el('toAccount').value;
    const memoKey = el('memoKey').value;
    const privateKey = el('privateKey').value;
    issueAsset(symbol, amount, toAccount, memoKey, privateKey);
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

function issueAsset(symbol, amount, toAccount, memoKey, privateKey) {
    output.innerHTML = 'Loading ...';
    dcore_js.asset().issueAsset(symbol, Number(amount), toAccount, memoKey, privateKey)
        .then(() => {
            output.innerHTML = 'Issue asset successfully';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error issuing asset</p>';
        });
}

//# sourceMappingURL=searchContent.js.map
