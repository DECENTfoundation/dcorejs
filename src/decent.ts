import {setLibRef} from './helpers';
import {ContentApi} from './content';
import {ChainApi} from './api/chain';
import {DatabaseApi} from './api/database';
import {AccountApi} from './account';

let decentjslib: any = null;
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
    decentjslib = decentjs_lib;
    setLibRef(decentjslib);
    ChainApi.setupChain(config.chain_id, decentjslib.ChainConfig);
    const database = DatabaseApi.create(config, decentjslib.Apis);
    const apiConnectionPromise = database.initApi();

    const chain = new ChainApi(apiConnectionPromise, decentjslib.ChainStore);
    _content = new ContentApi(database, chain);
    _account = new AccountApi(database, chain);
}

export function content(): ContentApi {
    return _content;
}

export function account(): AccountApi {
    return _account;
}
