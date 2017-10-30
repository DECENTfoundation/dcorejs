import {Decent} from 'decent-js';

// Initialization
const config = {
    decent_network_wspaths: ['wss://yout.decent.daemon:8090'],
    chain_id: 'your-decent-chain-id'
};

const decent = Decent.instance();
decent.initialize(config);

const elGammalPrivate = '32983749287349872934792739472387492387492834';
const contentId = '1.2.312';

// Content key restoration
decent.core.content.restoreContentKeys(elGammalPrivate, contentId)
    .then(key => {
        // ... now you are able to decrypt your content
    })
    .catch(err => {
        // error restoring key
    });
