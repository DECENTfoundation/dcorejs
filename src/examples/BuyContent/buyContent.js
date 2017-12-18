"use strict";
// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const decentNetworkAddresses = ['wss://stage.decentgo.com:8090'];

let decentjs_lib = window['decentjs-lib'];

decent.Decent.initialize({
    chain_id: chainId,
    decent_network_wspaths: decentNetworkAddresses
}, decentjs_lib);

const output = document.getElementById('output');
const result = document.getElementById('result');

output.innerHTML = 'Loading ...';
decent.content().searchContent(new decent.SearchParams())
    .then(content => {
        const data = renderContent(content);
        output.innerHTML = data;
    });

function renderContent(content) {
    let render = '<ul>';
    render += content.map(c => '<li>' + c.synopsis.title + '</li> <button type="button" value="c.id" onclick="buyContent(\'' +  c.id + '\')">Buy</button>');
    render += '</ul>';

    if (content.length === 0) {
        render = '<h3>No content</h3>'
    }

    return render
}


// Define own values for variables
const buyerId = '1.2.30';
const elGamalPublic = '7317752633383033582159088041509593492238468350205070200236191783227692402591973343242224306276612029080797696757604654009350847591901976526778157668840202.';
const privateKey = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';

function buyContent(contentId) {
    console.log(contentId);
    result.innerHTML = 'Loading ...';
    decent.content().buyContent(contentId, buyerId, elGamalPublic, privateKey)
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