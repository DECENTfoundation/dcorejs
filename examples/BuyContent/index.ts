// import from node_modules
import {Decent} from 'decent-js';

// Initialization
const config = {
    decent_network_wspaths: ['wss://your.decent.daemon:8090'],
    chain_id: 'your-decent-chain-id'
};

const decent = Decent.instance();
decent.initialize(config);

// Content Buying
const contentId = '1.2.3';
const accountId = '1.3.45';
const privateKey = 'ac7b6876b8a7b68a7c6b8a7c6b8a7cb68a7cb78a6cb8';
const publicKey = 'DCT8ca8b79a8b79a8cb9a8b79a8b79a8c7b98ac7b';
const elGammalPublic = '704978309485720398475187405981709436818374592763459872645';

decent.core.content.buyContent(
    contentId,
    accountId,
    elGammalPublic,
    privateKey,
    publicKey)
    .then(() => {
        // Content successfully bought
    })
    .catch(() => {
        // buy unsuccessful, handle buy error
    });
