"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const payer = el('payer').value;
    const symbol = el('symbol').value;
    const amount = Number(el('amount').value);
    const privateKey = el('privateKey').value;
    reserveAsset(payer, symbol, amount, privateKey);
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

function reserveAsset(payer, symbol, amount, privateKey) {
    output.innerHTML = 'Loading ...';
    dcore_js.asset().assetReserve(payer, symbol, amount, privateKey)
        .then(res => {
            output.innerHTML = 'Asset successfully reserved';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error reserving asset</p>';
        });
}

//# sourceMappingURL=searchContent.js.map
