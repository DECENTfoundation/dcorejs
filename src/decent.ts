import { setLibRef } from './helpers';
import { ContentApi } from './content';
import { ChainApi } from './api/chain';
import { DatabaseApi } from './api/database';
import { AccountApi } from './account';
import { HistoryApi } from './api/history';
import { ApiConnector } from './api/apiConnector';
import {ExplorerModule} from './explorer';

let _content: ContentApi;
let _account: AccountApi;
let _explorer: ExplorerModule;

export class DecentError {
    static app_not_initialized = 'app_not_initialized';
    static app_missing_config = 'app_missing_config';
}

export interface DecentConfig {
    dcoreNetworkWSPaths: string[]
    chainId: string
}

/**
 * Intialize decent-js library with custom data that are used for library operations
 *
 * @export
 * @param {DecentConfig} config                                 Configuration of decent network yout about to connect to
 * @param {*} dcore                                             Reference to low level decentjs-lib library
 * @param {(string) => void} [connectionStatusCallback=null]    Status callback to handle connection. Available states are
 *                                                              defined in ConnectionState enum
 */
export function initialize(config: DecentConfig, dcore: any, connectionStatusCallback: (string) => void = null): void {
    setLibRef(dcore);
    ChainApi.setupChain(config.chainId, dcore.ChainConfig);

    const connector = new ApiConnector(config.dcoreNetworkWSPaths, dcore.Apis, connectionStatusCallback);

    const database = new DatabaseApi(dcore.Apis, connector);
    const historyApi = new HistoryApi(dcore.Apis, connector);

    const chain = new ChainApi(connector, dcore.ChainStore);
    _content = new ContentApi(database, chain);
    _account = new AccountApi(database, chain, historyApi);
    _explorer = new ExplorerModule(database);
}

export function content(): ContentApi {
    return _content;
}

export function account(): AccountApi {
    return _account;
}

export function explorer(): ExplorerModule {
    return _explorer;
}
