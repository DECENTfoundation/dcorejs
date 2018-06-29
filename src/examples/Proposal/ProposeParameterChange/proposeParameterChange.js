"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const proposer = el('proposer').value;
    const fromAccount = el('fromAccount').value;
    const toAccount = el('toAccount').value;
    const amount = el('amount').value;
    const assetId = el('assetId').value;
    const memoKey = el('memoKey').value;
    const expiration = el('expiration').value;
    const privateKey = el('privateKey').value;
    proposeTransfer(proposer, fromAccount, toAccount, amount, assetId, memoKey, expiration, privateKey);
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

function proposeTransfer(proposer, fromAccount, toAccount, amount, assetId, memoKey, expiration, privateKey) {
    output.innerHTML = 'Loading ...';
    dcore_js.proposal().proposeTransfer(proposer, fromAccount, toAccount, Number(amount), assetId, memoKey, expiration, privateKey)
        .then(() => {
            output.innerHTML = 'Transfer successfully proposed';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error proposing transfer</p>';
        });
}

//# sourceMappingURL=searchContent.js.map