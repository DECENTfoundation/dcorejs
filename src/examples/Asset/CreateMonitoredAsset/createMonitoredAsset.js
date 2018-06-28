"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const issuer = el('issuer').value;
    const symbol = el('symbol').value;
    const precision = el('precision').value;
    const description = el('description').value;
    const feedLifeTimeSec = el('feedLifeTimeSec').value;
    const minimumFeeds = el('minimumFeeds').value;
    const privateKey = el('privateKey').value;
    createMonitoredAsset(issuer, symbol, precision, description, feedLifeTimeSec, minimumFeeds, privateKey);
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

function createMonitoredAsset(issuer, symbol, precision, description, feedLifeTimeSec, minimumFeeds, privateKey) {
    output.innerHTML = 'Loading ...';
    dcore_js.asset().createMonitoredAsset(issuer, symbol, Number(precision), description, Number(feedLifeTimeSec), Number(minimumFeeds), privateKey)
        .then(() => {
            output.innerHTML = 'Monitored asset successfully proposed';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error proposing monitored asset</p>';
        });
}

//# sourceMappingURL=searchContent.js.map