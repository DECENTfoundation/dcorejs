"use strict";

const el = id => document.getElementById(id);

el('transferButton').onclick = () => {
    transfer('1.2.30', receiverInput.value, amountInput.value, memoInput.value);
};
const output = el('output');

const amountInput = el('amount');
const receiverInput = el('receiver');
const memoInput = el('memo');

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];
const privateKey = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, dcorejs_lib);

function transfer(fromAccount, toAccount, amount, memo) {
    output.innerHTML = 'Loading ...';
    dcore_js.account().transfer(amount, fromAccount, toAccount, memo, privateKey)
        .then(result => {
            output.innerHTML = '<h3 style="color: green;">Payment successful</h3>';
            console.log(result);
            output.innerHTML += '<br/>';
            output.innerHTML += '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<h3 style="color: red;">Error transfering DCT</h3>';
        });
}

//# sourceMappingURL=searchContent.js.map