"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const keyword = el('keyword').value;
    listActiveSubscriptionByConsumer(keyword);
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

function listActiveSubscriptionByConsumer(consumerId) {
    output.innerHTML = 'Loading ...';
    dcore_js.subscription().listActiveSubscriptionsByConsumer(consumerId)
        .then(res => {
            output.innerHTML = '';
            for (let i = 0; i < res.length; i++) {
                const result = res[i];
                output.innerHTML += '<h3>Id: ' + result.id + '</h3>';
                output.innerHTML += '<h3>From: ' + result.from + '</h3>';
                output.innerHTML += '<h3>To: ' + result.to + '</h3>';
                output.innerHTML += JSON.stringify(result, null, 2);
            }
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error listing active subscriptions</p>';
        });
}

//# sourceMappingURL=searchContent.js.map
