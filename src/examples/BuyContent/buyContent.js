"use strict";
// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];

const dcore = window['dcore'];
const dcore_js = window['dcore-js'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, dcore);

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
const buyerId = '1.2.30';
const elGamalPublic = '7317752633383033582159088041509593492238468350205070200236191783227692402591973343242224306276612029080797696757604654009350847591901976526778157668840202.';
const privateKey = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';

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