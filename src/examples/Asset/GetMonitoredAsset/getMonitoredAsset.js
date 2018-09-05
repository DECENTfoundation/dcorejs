"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const assetId = el('assetId').value;
    getMonitoredAsset(assetId);
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

function getMonitoredAsset(assetId) {
    output.innerHTML = 'Loading ...';
    dcore_js.asset().getMonitoredAssetData(assetId)
        .then(res => {
            output.innerHTML = '';
            output.innerHTML += JSON.stringify(res, null, 2);
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error getting monitored asset</p>';
        });
}

//# sourceMappingURL=searchContent.js.map
