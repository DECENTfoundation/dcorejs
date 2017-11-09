import { Decent } from 'decent-js';

// Initialization
const config = {
    decent_network_wspaths: ['wss://your.decent.daemon:8090'],
    chain_id: 'your-decent-chain-id'
};

Decent.initialize(config);
