"use strict";

const el = document.getElementById.bind(document);

el('searchButton').onclick = () => {
    const keyword = el('keyword').value;
    getAccount(keyword);
};
const output = el('output');

const decentjs_lib = window['decentjs-lib'];

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const decentNetworkAddresses = ['wss://stage.decentgo.com:8090'];

decent.initialize({
    chain_id: chainId,
    decent_network_wspaths: decentNetworkAddresses
}, decentjs_lib);

function getAccount(accountId) {
    output.innerHTML = 'Loading ...';
    decent.account().getAccountById(accountId)
        .then(res => {
            output.innerHTML = '';
            output.innerHTML += '<h3>Id: ' + res.id + '</h3>';
            output.innerHTML += '<h3>Name: ' + res.name + '</h3>';
            output.innerHTML += '<h3>Auth: ' + res.owner.key_auths[0][0] + '</h3>';
            output.innerHTML += '<h3>Registered by: ' + res.registrar + '</h3>';
            output.innerHTML += JSON.stringify(res);
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error loading user account</p>';
        });
}

//# sourceMappingURL=searchContent.js.map