import {getLibRef} from './helpers';
import {ContentApi} from './modules/content';
import {ChainApi, ChainSubscriptionCallback} from './api/chain';
import {DatabaseApi} from './api/database';
import {AccountApi} from './modules/account';
import {HistoryApi} from './api/history';
import {ApiConnector, ConnectionState} from './api/apiConnector';
import {AssetModule} from './modules/asset';
import {ExplorerModule} from './modules/explorer';
import {MiningModule} from './modules/mining';
import {SubscriptionModule} from './modules/subscription';
import {SeedingModule} from './modules/seeding';
import {ProposalModule} from './modules/proposal';
import {Transaction} from './transaction';

let _content: ContentApi;
let _account: AccountApi;
let _explorer: ExplorerModule;
let _assetModule: AssetModule;
let _mining: MiningModule;
let _subscription: SubscriptionModule;
let _seeding: SeedingModule;
let _proposal: ProposalModule;
let _chain: ChainApi;
let _transaction: Transaction;

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
 * @param {*} [dcorejs_lib=null]                                                Deprecated - Reference to low level dcorejs-lib library
 * @param {(state: ConnectionState) => void} [connectionStatusCallback=null]    Status callback to handle connection
 */
export function initialize(config: DcoreConfig,
                           dcorejs_lib: any = null,
                           connectionStatusCallback: (state: ConnectionState) => void = null): void {
    if (dcorejs_lib) {
        console.warn('Parameter dcorejs_lib of DCorejs.initialize is deprecated since 2.3.1');
    }
    const dcore = getLibRef();
    ChainApi.setupChain(config.chainId, dcore.ChainConfig);

    const connector = new ApiConnector(config.dcoreNetworkWSPaths, dcore.Apis, connectionStatusCallback);
    const database = new DatabaseApi(dcore.Apis, connector);
    const historyApi = new HistoryApi(dcore.Apis, connector);

    _chain = new ChainApi(connector, dcore.ChainStore);
    _content = new ContentApi(database);
    _account = new AccountApi(database, _chain, historyApi, connector);
    _explorer = new ExplorerModule(database);
    _assetModule = new AssetModule(database, connector, _chain);
    _subscription = new SubscriptionModule(database, connector);
    _seeding = new SeedingModule(database);
    _mining = new MiningModule(database, connector, _chain);
    _proposal = new ProposalModule(database, _chain, connector);
    _transaction = new Transaction();
}

/**
 * Subscribe for blockchain update notifications. Notifications is fired periodically.
 *
 * @param {(data: any[]) => void} callback
 */
export function subscribe(callback: ChainSubscriptionCallback) {
    _chain.subscribe(callback);
}

/**
 * Subscribe for events fired everytime new transaction is broadcasted to network
 *
 * @param callback
 */
export function subscribePendingTransaction(callback: ChainSubscriptionCallback) {
    _chain.subscribePendingTransactions(callback);
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

export function asset(): AssetModule {
    return _assetModule;
}
export function mining(): MiningModule {
    return _mining;
}

export function subscription(): SubscriptionModule {
    return _subscription;
}

export function seeding(): SeedingModule {
    return _seeding;
}

export function proposal(): ProposalModule {
    return _proposal;
}

export function transaction(): Transaction {
    return _transaction;
}
