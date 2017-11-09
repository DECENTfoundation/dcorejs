import {Content, Decent, SearchParams, SearchParamsOrder} from 'decent-js';

// Initialization
const config = {
    decent_network_wspaths: ['wss://your.decent.daemon:8090'],
    chain_id: 'your-decent-chain-id'
};

Decent.initialize(config);

// Content searching
const term = 'some phrase';
const order = SearchParamsOrder.createdDesc;
const user = '1.2.345';
const region_code = 'en';
const itemId = '0.0.0';
const category = '1';
const count = 4;

const searchParams: SearchParams = new SearchParams(
    term, order, user, region_code, itemId, category, count
);
Decent.core.content.searchContent(searchParams)
    .then((contents: Content[]) => {
        console.log(contents);
    })
    .catch(err => {
        console.log(err);
    });
