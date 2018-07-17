"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const payer = el('payer').value;
    const uiaAmount = Number(el('uiaAmount').value);
    const uiaSymbol = el('uiaSymbol').value;
    const dctAmount = Number(el('dctAmount').value);
    const privateKey = el('privateKey').value;
    fundAssetPools(payer, uiaAmount, uiaSymbol, dctAmount, privateKey);
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
}, false, dcorejs_lib);

function fundAssetPools(payer, uiaAmount, uiaSymbol, dctAmount, privateKey) {
    output.innerHTML = 'Loading ...';
    dcore_js.asset().fundAssetPools(payer, uiaAmount, uiaSymbol, dctAmount, privateKey)
        .then(res => {
            output.innerHTML = 'Fund asset pools successful';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error funding asset pools</p>';
        });
}

//# sourceMappingURL=searchContent.js.map