import { setLibRef } from './helpers';
import { ContentApi } from './content';
import { ChainApi } from './api/chain';
import { DatabaseApi } from './api/database';
import { AccountApi } from './account';
import { HistoryApi } from './api/history';
import { ApiConnector } from './api/apiConnector';

let _decentjslib: any;
let _content: ContentApi;
let _account: AccountApi;

export class DecentError {
    static app_not_initialized = 'app_not_initialized';
    static app_missing_config = 'app_missing_config';
}

export interface DecentConfig {
    decent_network_wspaths: string[]
    chain_id: string
}

export function initialize(config: DecentConfig, decentjs_lib: any): void {
    _decentjslib = decentjs_lib;
    setLibRef(_decentjslib);
    ChainApi.setupChain(config.chain_id, _decentjslib.ChainConfig);

    const connector = new ApiConnector(config.decent_network_wspaths, _decentjslib.Apis);

    const database = new DatabaseApi(_decentjslib.Apis, connector);
    const historyApi = new HistoryApi(_decentjslib.Apis, connector);

    const chain = new ChainApi(connector, _decentjslib.ChainStore);
    _content = new ContentApi(database, chain);
    _account = new AccountApi(database, chain, historyApi);
}

export function content(): ContentApi {
    return _content;
}

export function account(): AccountApi {
    return _account;
}
