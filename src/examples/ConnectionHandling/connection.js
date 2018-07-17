"use strict";

const el = id => document.getElementById(id);

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, false, dcorejs_lib, handleState);

const output = el('output');

function handleState(state) {
    let msg = '';
    switch (state) {
        case 'open':
            msg = 'Connection opened';
            break;
        case 'closed':
            msg = 'Connection closed';
            break;
        case 'reconnect':
            msg = 'Reconnecting ...';
            break;
        case 'error':
            msg = '!!! Connection falied !!!';
            break;
        default:
            msg = 'Unknown state';
            break;
    }

    output.innerHTML = msg;
}
