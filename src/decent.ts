import {setLibRef} from './helpers';
import {ContentApi} from './content';
import {ChainApi} from './api/chain';
import {DatabaseApi} from './api/database';
import {AccountApi} from './account';
import {HistoryApi} from './api/history';
import {ApiConnector} from './api/apiConnector';

let decentjslib: any = null;
let _content: ContentApi = null;
let _account: AccountApi = null;
let _history: HistoryApi = null;

export class DecentError {
    static app_not_initialized = 'app_not_initialized';
    static app_missing_config = 'app_missing_config';
}

export interface DecentConfig {
    decent_network_wspaths: string[]
    chain_id: string
}

export function initialize(config: DecentConfig, decentjs_lib: any): void {
    decentjslib = decentjs_lib;
    setLibRef(decentjslib);
    ChainApi.setupChain(config.chain_id, decentjslib.ChainConfig);

    const connector = new ApiConnector(config.decent_network_wspaths, decentjslib.Apis);

    const database = new DatabaseApi(decentjslib.Apis, connector);
    const historyApi = new HistoryApi(decentjs_lib.Apis, connector);
    _history = historyApi;

    const chain = new ChainApi(connector, decentjslib.ChainStore);
    _content = new ContentApi(database, chain);
    _account = new AccountApi(database, chain, historyApi);
}

export function content(): ContentApi {
    return _content;
}

export function account(): AccountApi {
    return _account;
}
