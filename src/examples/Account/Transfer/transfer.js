"use strict";

const el = id => document.getElementById(id);

el('transferButton').onclick = () => {
    transfer(senderInput.value, receiverInput.value, amountInput.value, assetIdInput.value, memoInput.value, privateKey.value);
};
const output = el('output');

const amountInput = el('amount');
const assetIdInput = el('assetId');
const senderInput = el('sender');
const receiverInput = el('receiver');
const memoInput = el('memo');
const privateKey = el('privateKey');

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, false, dcorejs_lib);

function transfer(fromAccount, toAccount, amount, assetId, memo, privateKey) {
    output.innerHTML = 'Loading ...';
    dcore_js.account().transfer(Number(amount), assetId, fromAccount, toAccount, memo, privateKey)
        .then(result => {
            output.innerHTML = '<h3 style="color: green;">Payment successful</h3>';
            output.innerHTML += '<br/>';
            output.innerHTML += '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<h3 style="color: red;">Error transfering DCT</h3>';
        });
}

//# sourceMappingURL=searchContent.js.map
