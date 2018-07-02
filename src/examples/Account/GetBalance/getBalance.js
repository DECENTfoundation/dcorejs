"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const keyword = el('keyword').value;
    getBalance(keyword);
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

function getBalance(accountId) {
    output.innerHTML = 'Loading ...';
    dcore_js.account().getBalance(accountId)
        .then(res => {
            output.innerHTML = 'Balance is: ';
            output.innerHTML += JSON.stringify(res, null, 2);
            output.innerHTML += ' DCT';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error loading balance</p>';
        });
}

//# sourceMappingURL=searchContent.js.map