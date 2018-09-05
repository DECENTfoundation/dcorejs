"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const keyword = el('keyword').value;
    getAccountByName(keyword);
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

function getAccountByName(accountName) {
    output.innerHTML = 'Loading ...';
    dcore_js.account().getAccountByName(accountName)
        .then(res => {
            output.innerHTML = '';
            output.innerHTML += '<h3>Id: ' + res.id + '</h3>';
            output.innerHTML += '<h3>Name: ' + res.name + '</h3>';
            output.innerHTML += '<h3>Auth: ' + res.owner.key_auths[0][0] + '</h3>';
            output.innerHTML += '<h3>Registered by: ' + res.registrar + '</h3>';
            output.innerHTML += JSON.stringify(res, null, 2);
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error loading user account</p>';
        });
}

//# sourceMappingURL=searchContent.js.map
