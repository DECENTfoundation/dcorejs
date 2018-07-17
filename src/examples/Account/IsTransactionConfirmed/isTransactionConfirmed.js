"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const accountId = el('accountId').value;
    const transactionId = el('transactionId').value;
    getTransactionHistory(accountId, transactionId);
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

function getTransactionHistory(accountId, transactionId) {
    output.innerHTML = 'Loading ...';
    dcore_js.account().isTransactionConfirmed(accountId, transactionId)
        .then(res => {
            console.log(res);
            output.innerHTML = '';
            // for (let i = 0; i < res.length; i++) {
            //     const result = res[i];
            //     output.innerHTML += '<h3>From: ' + result.fromAccountId + '</h3>';
            //     output.innerHTML += '<h3>To: ' + result.toAccountId + '</h3>';
            //     output.innerHTML += '<h3>Amount: ' + result.transactionAmount + '</h3>';
            //     output.innerHTML += '<h3>Asset: ' + result.transactionAsset + '</h3>';
            //     output.innerHTML += JSON.stringify(result, null, 2);
            // }
            output.innerHTML += JSON.stringify(res, null, 2);
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error loading transaction confirmation</p>';
        });
}

//# sourceMappingURL=searchContent.js.map