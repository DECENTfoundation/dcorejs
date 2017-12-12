import { DatabaseApi } from './../src/api/database';
import { ChainApi } from './../src/api/chain';
import { Decent } from '../src/decent';
import * as Decentjs from 'decentjs-lib';

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
let chainApi: ChainApi;

function initLib() {
    // Decent.initialize({
    //     decent_network_wspaths: ['wss://stage.decentgo.com:8090'],
    //     chain_id: '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc'
    // }, Decentjs);
    // console.log(process.env);
    ChainApi.setupChain(chainId, Decentjs.ChainConfig);
    const db = new DatabaseApi({decent_network_wspaths: ['wss://stage.decentgo.com:8090']}, Decentjs.Apis);
    const dbApiConnector = db.initApi();
    chainApi = new ChainApi(dbApiConnector, Decentjs.ChainStore);
    // console.log(chainApi);
}

beforeAll(() => initLib());

describe('ChainApi test', () => {
    it('fetch user account', () => {
        expect(true).toBeTruthy();
    });
});
