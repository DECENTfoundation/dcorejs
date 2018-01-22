import { setLibRef } from './helpers';
import { ContentApi } from './content';
import { ChainApi } from './api/chain';
import { DatabaseApi } from './api/database';
import { AccountApi } from './account';
import { HistoryApi } from './api/history';
import { ApiConnector, ConnectionState } from './api/apiConnector';
import { ExplorerModule } from './explorer';

let _content: ContentApi;
let _account: AccountApi;
let _explorer: ExplorerModule;

export class DcoreError {
    static app_not_initialized = 'app_not_initialized';
    static app_missing_config = 'app_missing_config';
}

export interface DcoreConfig {
    dcoreNetworkWSPaths: string[]
    chainId: string
}

/**
 * Intialize dcorejs library with custom data that are used for library operations
 *
 * @export
 * @param {DcoreConfig} config                                                  Configuration of dcore network yout about to connect to
 * @param {*} dcorejs_lib                                                             Reference to low level dcorejs-lib library
 * @param {(state: ConnectionState) => void} [connectionStatusCallback=null]    Status callback to handle connection
 */
export function initialize(config: DcoreConfig, dcorejs_lib: any, connectionStatusCallback: (state: ConnectionState) => void = null): void {
    setLibRef(dcorejs_lib);
    ChainApi.setupChain(config.chainId, dcorejs_lib.ChainConfig);

    const connector = new ApiConnector(config.dcoreNetworkWSPaths, dcorejs_lib.Apis, connectionStatusCallback);

    const database = new DatabaseApi(dcorejs_lib.Apis, connector);
    const historyApi = new HistoryApi(dcorejs_lib.Apis, connector);

    const chain = new ChainApi(connector, dcorejs_lib.ChainStore);
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
