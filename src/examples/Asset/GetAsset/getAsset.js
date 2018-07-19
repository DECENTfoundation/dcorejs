"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const keyword = el('keyword').value;
    getAsset(keyword);
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

function getAsset(assetId) {
    output.innerHTML = 'Loading ...';
    dcore_js.asset().getAsset(assetId)
        .then(res => {
            output.innerHTML = '';
            output.innerHTML += '<h3>Id: ' + res.id + '</h3>';
            output.innerHTML += '<h3>Symbol: ' + res.symbol + '</h3>';
            output.innerHTML += '<h3>Description: ' + res.description + '</h3>';
            output.innerHTML += JSON.stringify(res, null, 2);
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error loading asset</p>';
        });
}

//# sourceMappingURL=searchContent.js.map