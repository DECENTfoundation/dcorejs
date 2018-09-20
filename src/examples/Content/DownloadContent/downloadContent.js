"use strict";

const el = id => document.getElementById(id);

const output = el('output');
const keyOut = el('key');
const info = el('info');

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, false);

// Define own values for variables
const elGamalPrivate = '10052350047151250452972738120447855146606648325351208980751111128157011481411054178116934354199808094865880555005273718347076878505033381872379935044832438.';
const elGamalPublic = '3903601357438804864687954096730930993527252589773947100727118641221811731774750382437129440820248832424856134084086582824524317869837087666080614012324675.';
const keyPair = new dcore_js.KeyPair(elGamalPrivate, elGamalPublic);
const accountId = '1.2.27';

output.innerHTML = 'Loading ...';
dcore_js.content().getPurchasedContent(accountId)
    .then(purchasedContent => {
        const data = renderContent(purchasedContent);
        output.innerHTML = data;
    });

function renderContent(content) {
    const render = [];
    if (content.length === 0) {
        render.push('<h3>No content</h3>');
    } else {
        render.push('<ul>');
        render.push(content.map(c => '<li>' + c.synopsis.title + '</li> <button type="button" value="c.id" onclick="downloadContent(\'' + c.buy_id + '\')">Download</button>'));
        render.push('</ul>');
    }
    return render.join('');
}

function downloadContent(contentId) {
    keyOut.innerHTML = 'Loading ...';
    dcore_js.content().restoreContentKeys(contentId, accountId, keyPair)
        .then(key => {
            console.log('Successful');
            keyOut.innerHTML = 'Restored content key for decryption: <b>' + key + '</b>';
            info.innerHTML = 'INFO: This key can be used to decrypt content downloaded from IPFS storage';
        })
        .catch(err => {
            console.error(err);
            keyOut.innerHTML = '<p style="color: red;">Error download content</p>';
        });
}

//# sourceMappingURL=searchContent.js.map
