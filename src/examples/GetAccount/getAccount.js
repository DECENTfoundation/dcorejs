"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const keyword = el('keyword').value;
    getAccount(keyword);
};
const output = el('output');

const dcore = window['dcore'];
const dcore_js = window['dcore-js'];

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, dcore);

function getAccount(accountId) {
    output.innerHTML = 'Loading ...';
    dcore_js.account().getAccountById(accountId)
        .then(res => {
            output.innerHTML = '';
            output.innerHTML += '<h3>Id: ' + res.id + '</h3>';
            output.innerHTML += '<h3>Name: ' + res.name + '</h3>';
            output.innerHTML += '<h3>Auth: ' + res.owner.key_auths[0][0] + '</h3>';
            output.innerHTML += '<h3>Registered by: ' + res.registrar + '</h3>';
            output.innerHTML += JSON.stringify(res);
            debugger;
            console.log(dcore_js.account().handleError('pico', 'vina'));
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error loading user account</p>';
        });
}

//# sourceMappingURL=searchContent.js.map