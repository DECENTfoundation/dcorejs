"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const keyword = el('keyword').value;
    listAssets(keyword);
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

function listAssets(symbol) {
    output.innerHTML = 'Loading ...';
    let limit = (symbol !== '') ? 1 : 100;
    dcore_js.asset().listAssets(symbol, limit)
        .then(res => {
            output.innerHTML = '';
            for (var i = 0; i < res.length; i++) {
                const result = res[i];
                output.innerHTML += '<h3>Id: ' + result.id + '</h3>';
                output.innerHTML += '<h3>Symbol: ' + result.symbol + '</h3>';
                output.innerHTML += '<h3>Description: ' + result.description + '</h3>';
                output.innerHTML += JSON.stringify(result, null, 2);
            }
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error loading assets</p>';
        });
}

//# sourceMappingURL=searchContent.js.map