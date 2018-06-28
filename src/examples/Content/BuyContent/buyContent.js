"use strict";
// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, dcorejs_lib);

const el = id => document.getElementById(id);

const output = el('output');
const result = el('result');

output.innerHTML = 'Loading ...';
dcore_js.content().searchContent(new dcore_js.SearchParams())
    .then(content => {
        output.innerHTML = renderContent(content);
    });

function renderContent(content) {
    const render = [];
    if (content.length === 0) {
        render.push('<h3>No content</h3>');
    } else {
        render.push('<ul>');
        render.push(content.map(c => '<li>' + c.synopsis.title + '</li> <button type="button" value="c.id" onclick="buyContent(\'' +  c.id + '\')">Buy</button>'));
        render.push('</ul>');
    }
    return render.join('');
}


// Define own values for variables
const buyerId = '1.2.27';
const elGamalPublic = '3903601357438804864687954096730930993527252589773947100727118641221811731774750382437129440820248832424856134084086582824524317869837087666080614012324675.';
const privateKey = '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ';

function buyContent(contentId) {
    result.innerHTML = 'Loading ...';
    dcore_js.content().buyContent(contentId, buyerId, elGamalPublic, privateKey)
        .then(() => {
            console.log('Successful');
            result.innerHTML = '<p style="color: green;">Content bought</p>';
        })
        .catch(err => {
            console.error(err);
            result.innerHTML = '<p style="color: red;">Content already bought or own content</p>';
        });
}

//# sourceMappingURL=searchContent.js.map