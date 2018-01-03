import { setLibRef } from './helpers';
import { ContentApi } from './content';
import { ChainApi } from './api/chain';
import { DatabaseApi } from './api/database';
import { AccountApi } from './account';

let _decentjslib: any = null;
let _content: ContentApi = null;
let _account: AccountApi = null;

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
    const database = DatabaseApi.create(config, _decentjslib.Apis);
    const apiConnectionPromise = database.initApi();

    const chain = new ChainApi(apiConnectionPromise, _decentjslib.ChainStore);
    _content = new ContentApi(database, chain);
    _account = new AccountApi(database, chain);
}

export function content(): ContentApi {
    return _content;
}

export function account(): AccountApi {
    return _account;
}
