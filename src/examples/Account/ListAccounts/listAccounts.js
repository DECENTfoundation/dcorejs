"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    listAccounts();
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

function listAccounts() {
    output.innerHTML = 'Loading ...';
    dcore_js.account().listAccounts()
        .then(res => {
            output.innerHTML = '';
            for (let i = 0; i < res.length; i++) {
                const result = res[i];
                output.innerHTML += '<h3>Account: </h3>';
                output.innerHTML += '<pre>Name: ' + result[0] + '</pre>';
                output.innerHTML += '<pre>Id: ' + result[1] + '</pre>';
            }
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error listing accounts</p>';
        });
}

//# sourceMappingURL=searchContent.js.map
