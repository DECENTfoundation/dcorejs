/**
 * @module DCore
 */
import {getLibRef} from './helpers';
import {ContentModule} from './modules/content';
import {ChainApi} from './api/chain';
import {DatabaseApi} from './api/database';
import {AccountModule} from './modules/account';
import {HistoryApi} from './api/history';
import {ApiConnector, ConnectionState} from './api/apiConnector';
import {AssetModule} from './modules/asset';
import {ExplorerModule} from './modules/explorer';
import {MiningModule} from './modules/mining';
import {SubscriptionModule} from './modules/subscription';
import {SeedingModule} from './modules/seeding';
import {ProposalModule} from './modules/proposal';
import {TransactionBuilder} from './transactionBuilder';
import {ChainSubscriptionBlockAppliedCallback, ChainSubscriptionCallback} from './api/model/chain';
import {MessagingApi} from './api/messaging';
import {MessagingModule} from './modules/messaging';

let _content: ContentModule;
let _account: AccountModule;
let _explorer: ExplorerModule;
let _assetModule: AssetModule;
let _mining: MiningModule;
let _subscription: SubscriptionModule;
let _seeding: SeedingModule;
let _proposal: ProposalModule;
let _chain: ChainApi;
let _transactionBuilder: TransactionBuilder;
let _messaging: MessagingModule;
let _connector: ApiConnector;

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
                           testConnection: boolean = true,
                           dcorejs_lib: any = null,
                           connectionStatusCallback: (state: ConnectionState) => void = null): void {
    if (dcorejs_lib) {
        console.warn('Parameter dcorejs_lib of DCorejs.initialize is deprecated since 2.3.1');
    }
    const dcore = getLibRef();
    ChainApi.setupChain(config.chainId, dcore.ChainConfig);

    _connector = new ApiConnector(config.dcoreNetworkWSPaths, dcore.Apis, testConnection, connectionStatusCallback);
    const database = new DatabaseApi(dcore.Apis, _connector);
    const historyApi = new HistoryApi(dcore.Apis, _connector);
    const messagingApi = new MessagingApi(dcore.Apis, _connector);

    _chain = new ChainApi(_connector, dcore.ChainStore);
    _content = new ContentModule(database, _chain, _connector);
    _account = new AccountModule(database, _chain, historyApi, _connector);
    _explorer = new ExplorerModule(database);
    _assetModule = new AssetModule(database, _connector, _chain);
    _subscription = new SubscriptionModule(database, _connector);
    _seeding = new SeedingModule(database);
    _mining = new MiningModule(database, _connector, _chain);
    _proposal = new ProposalModule(database, _chain, _connector);
    _transactionBuilder = new TransactionBuilder();
    _messaging = new MessagingModule(database, messagingApi);
}

/**
 * Subscribe for blockchain update notifications. Notifications is fired periodically.
 *
 * @param {(data: any[]) => void} callback
 */
export function subscribe(callback: ChainSubscriptionCallback) {
    _chain.subscribe(callback);
}

export function subscribeBlockApplied(callback: ChainSubscriptionBlockAppliedCallback) {
    _chain.subscribeBlockApplied(callback);
}

/**
 * Subscribe for events fired everytime new transaction is broadcasted to network
 *
 * @param callback
 */
export function subscribePendingTransaction(callback: ChainSubscriptionCallback) {
    _chain.subscribePendingTransactions(callback);
}

export function content(): ContentModule {
    return _content;
}

export function account(): AccountModule {
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

export function messaging(): MessagingModule {
    return _messaging;
}

export function transactionBuilder(): TransactionBuilder {
    _transactionBuilder = new TransactionBuilder();
    return _transactionBuilder;
}

export function connection() {
    return _connector;
}
