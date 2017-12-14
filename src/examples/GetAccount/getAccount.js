"use strict";

document.getElementById('searchButton').onclick = () => {
    const keyword = document.getElementById('keyword').value;
    console.log('dasdasda');
    getAccount(keyword);
};
const output = document.getElementById('output');

let decentjs_lib = window['decentjs-lib'];

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const decentNetworkAddresses = ['wss://stage.decentgo.com:8090'];

decent.initialize({
    chain_id: chainId,
    decent_network_wspaths: decentNetworkAddresses
}, decentjs_lib);

function renderContent(content) {
    let render = '<ul>';
    render += content.map(c => '<li>' + c.synopsis.title + '</li> <button type="button" value="c.id" onclick="downloadContent(\'' +  c.buy_id + '\')">Download</button>');
    render += '</ul>';
    return render
}

function getAccount(accountId) {
    console.log(accountId);
    output.innerHTML = 'Loading ...';
    decent.account().getAccountById(accountId)
        .then(res => {
            console.log(res);
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