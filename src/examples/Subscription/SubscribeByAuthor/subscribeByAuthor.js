"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const from = el('fromAccount').value;
    const to = el('toAccount').value;
    const privateKey = el('privateKey').value;
    subscribeByAuthor(from, to, privateKey);
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

function subscribeByAuthor(from, to, privateKey) {
    output.innerHTML = 'Loading ...';
    dcore_js.subscription().subscribeByAuthor(from, to, privateKey)
        .then(() => {
            output.innerHTML = 'Subscribed by author is successful';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error subscribing by author</p>';
        });
}

//# sourceMappingURL=searchContent.js.map