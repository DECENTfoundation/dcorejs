"use strict";

const el = id => document.getElementById(id);

const output = el('output');
const keyOut = el('key');
const info = el('info');

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, dcorejs_lib);

// Define own values for variables
const elGamalPrivate = '10264811947384987455806884361188312159337997349773266680031652882869271200883393026310091771774151908862673648846588359689442630336710264201803312709689478';
const elGamalPublic = '7317752633383033582159088041509593492238468350205070200236191783227692402591973343242224306276612029080797696757604654009350847591901976526778157668840202.';
const keyPair = new dcore_js.KeyPair(elGamalPrivate, elGamalPublic);
const accountId = '1.2.30';

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