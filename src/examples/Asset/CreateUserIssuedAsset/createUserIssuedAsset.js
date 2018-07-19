"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const issuer = el('issuer').value;
    const symbol = el('symbol').value;
    const precision = Number(el('precision').value);
    const description = el('description').value;
    const maxSupplyNumber = Number(el('maxSupplyNumber').value);
    const baseAmount = Number(el('baseAmount').value);
    const quoteAmount = Number(el('quoteAmount').value);
    const isExchangeable = el('isExchangeable').value === 'true';
    const isSupplyFixed = el('isSupplyFixed').value === 'true';
    const privateKey = el('privateKey').value;
    createUserIssuedAsset(issuer, symbol, precision, description, maxSupplyNumber, baseAmount, quoteAmount, isExchangeable, isSupplyFixed, privateKey);
};
const output = el('output');
const isExchangeableValues = el('isExchangeable');
const isSupplyFixedValues = el('isSupplyFixed');

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, false, dcorejs_lib);

function fillValues() {
    const render = [];
    render.push('<option value="true">true</option>');
    render.push('<option value="false">false</option>');
    isExchangeableValues.innerHTML = render.join('');
    isSupplyFixedValues.innerHTML = render.join('');
}

fillValues();

function createUserIssuedAsset(issuer, symbol, precision, description, maxSupplyNumber, baseAmount, quoteAmount, isExchangeable, isSupplyFixed, privateKey) {
    output.innerHTML = 'Loading ...';
    dcore_js.asset().createUserIssuedAsset(issuer, symbol, precision, description, maxSupplyNumber, baseAmount, quoteAmount, isExchangeable, isSupplyFixed, privateKey)
        .then(() => {
            output.innerHTML = 'User issued asset successfully created';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error creating user issued asset</p>';
        });
}

//# sourceMappingURL=searchContent.js.map