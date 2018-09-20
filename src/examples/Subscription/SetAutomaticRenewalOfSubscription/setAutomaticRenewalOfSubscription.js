"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const accountId = el('accountId').value;
    const subscriptionId = el('subscriptionId').value;
    const automaticRenewal = el('automaticRenewal').value;
    const privateKey = el('privateKey').value;
    setAutomaticRenewalOfSubscription(accountId, subscriptionId, automaticRenewal, privateKey);
};
const output = el('output');
const values = el('automaticRenewal');

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, false);

function fillValues() {
    const render = [];
    render.push('<option value="true">true</option>');
    render.push('<option value="false">false</option>');
    values.innerHTML = render.join('');
}

fillValues();

function setAutomaticRenewalOfSubscription(accountId, subscriptionId, automaticRenewal, privateKey) {
    output.innerHTML = 'Loading....';
    dcore_js.subscription().setAutomaticRenewalOfSubscription(accountId, subscriptionId, automaticRenewal === 'true', privateKey)
        .then(() => {
            output.innerHTML = 'Set automatic renewal of subscription is successful';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error setting automatic renewal</p>';
        });
}

//# sourceMappingURL=searchContent.js.map
