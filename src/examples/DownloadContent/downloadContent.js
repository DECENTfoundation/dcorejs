"use strict";

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const decentNetworkAddresses = ['wss://stage.decentgo.com:8090'];

let decentjs_lib = window['decentjs-lib'];

decent.initialize({
    chain_id: chainId,
    decent_network_wspaths: decentNetworkAddresses
}, decentjs_lib);

const accountId = '1.2.30';

output.innerHTML = 'Loading ...';
decent.content().getPurchasedContent(accountId)
    .then(purchasedContent => {
        const data = renderContent(purchasedContent);
        const el = document.getElementById('output');
        el.innerHTML = data;
    });

function renderContent(content) {
    let render = '<ul>';
    render += content.map(c => '<li>' + c.synopsis.title + '</li> <button type="button" value="c.id" onclick="downloadContent(\'' +  c.buy_id + '\')">Download</button>');
    render += '</ul>';
    if (content.length === 0) {
        render = '<h3>No purchased content</h3>'
    }
    return render
}


// Define own values for variables

const elGamalPrivate = '10264811947384987455806884361188312159337997349773266680031652882869271200883393026310091771774151908862673648846588359689442630336710264201803312709689478';
const elGamalPublic = '7317752633383033582159088041509593492238468350205070200236191783227692402591973343242224306276612029080797696757604654009350847591901976526778157668840202';
const keyPair = new decent.KeyPair(elGamalPrivate, elGamalPublic);

const keyOut = document.getElementById('key');
const info = document.getElementById('info');

function downloadContent(contentId) {
    console.log(contentId);
    keyOut.innerHTML = 'Loading ...';
    decent.Decent.core.content.restoreContentKeys(contentId, accountId, keyPair)
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