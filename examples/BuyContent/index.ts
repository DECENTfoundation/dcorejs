// import from node_modules
import {Decent} from 'decent-js';

// Initialization
const config = {
    decent_network_wspaths: ['wss://your.decent.daemon:8090'],
    chain_id: 'your-decent-chain-id'
};

Decent.initialize(config);

// Content Buying
const contentId = '1.2.3';
const accountId = '1.3.45';
const privateKey = 'ac7b6876b8a7b68a7c6b8a7c6b8a7cb68a7cb78a6cb8';
const elGammalPublic = '704978309485720398475187405981709436818374592763459872645';

Decent.core.content.buyContent(
    contentId,
    accountId,
    elGammalPublic,
    privateKey)
    .then(() => {
        // Content successfully bought
    })
    .catch(() => {
        // buy unsuccessful, handle buy error
    });
