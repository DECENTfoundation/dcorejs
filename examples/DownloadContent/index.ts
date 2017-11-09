import { Decent } from 'decent-js';

// Initialization
const config = {
    decent_network_wspaths: ['wss://yout.decent.daemon:8090'],
    chain_id: 'your-decent-chain-id'
};

Decent.initialize(config);

const elGammalPrivate = '32983749287349872934792739472387492387492834';
const contentId = '1.2.312';
const hash = 'a8bc74b4cabcabac4acb26cab26abc2abc467abc';

// Content key restoration
Decent.core.content.restoreContentKeys(contentId, elGammalPrivate)
    .then(key => {
        Decent.storage.downloadFile(hash)
            .then(file => {
                // process file, e.g. decrypt
            })
            .catch(err => {
                // error fetching file from IPFS
            });
    })
    .catch(err => {
        // error restoring key
    });
