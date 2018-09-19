/**
 * @module ChainApi
 */
import { dcorejs_lib } from '../helpers';
import { ApiConnector } from './apiConnector';
import { ChainError, ChainSubscriptionCallback, Method } from './model/chain';
import { ApiModule } from '../modules/ApiModule';

export enum SubscriptionType {
    subscribePendingTransactions = 'subscribePendingTransactions',
    subscribeBlockApplied = 'subscribeBlockApplied',
    general = 'general'
}
export class Subscription {
    public readonly type: SubscriptionType;
    public readonly callback: ChainSubscriptionCallback;
    constructor(type: SubscriptionType, callback: ChainSubscriptionCallback) {
        this.type = type;
        this.callback = callback;
    }
}
export class ChainApi extends ApiModule {

    static asset = 'DCT';
    static asset_id = '1.3.0';
    static DCTPower = Math.pow(10, 8);
    private _apiConnector: ApiConnector;
    private _chainStore: any;

    public get chainId(): string {
        return dcorejs_lib.ChainConfig.networks.decent.chain_id;
    }

    /**
     * Generates random sequence of bytes
     */
    public static generateNonce(): string {
        return dcorejs_lib.TransactionHelper.unique_nonce_uint64();
    }

    public static setupChain(chainId: string, chainConfig: any) {
        chainConfig.networks.decent = {
            chain_id: chainId
        };
    }

    constructor(apiConnector: ApiConnector, chainStore: any) {
        super({});
        this._apiConnector = apiConnector;
        this._chainStore = chainStore;
    }

    /**
     * Fetches data from blockchain with given chain methods.
     *
     * Returns Promise.all with resolve result as array of results
     * in order of adding into ChainMethod
     *
     * @param {ChainMethods} methods
     * @return {Promise<any[]>}
     */
    public fetch(...methods: Method[]): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this.connect()
                .then(res => {
                    const commands = methods.map((method: Method) => dcorejs_lib.FetchChain(method.name, method.parameters));
                    Promise.all(commands)
                        .then(result => resolve(result))
                        .catch(err => {
                            reject(this.handleError(ChainError.command_execution_failed, err));
                        });
                })
                .catch(err => {
                    reject(this.handleError(ChainError.api_connection_failed, err));
                });
        });
    }

    public subscribe(callback: ChainSubscriptionCallback): Promise<Subscription> {
        return new Promise<Subscription>((resolve, reject) => {
            this.connect()
                .then(res => {
                    this._chainStore.subscribe(callback);
                    resolve(new Subscription(SubscriptionType.general, callback));
                })
                .catch(err => {
                    if (process.env.ENVIRONMENT === 'DEV') {
                        console.log(`debug => ${err}`);
                    }
                    reject(this.handleError(ChainError.api_connection_failed, err));
                });
        });
    }

    /**
     * @param callback  Callback method to handle subscription data.
     */
    public subscribePendingTransactions(callback: ChainSubscriptionCallback): Promise<Subscription> {
        return new Promise<Subscription>((resolve, reject) => {
            this.connect()
                .then(res => {
                    this._chainStore.subscribePendingTransaction(callback);
                    resolve(new Subscription(SubscriptionType.subscribePendingTransactions, callback));
                })
                .catch(err => {
                    if (process.env.ENVIRONMENT === 'DEV') {
                        console.log(`debug => ${err}`);
                    }
                    reject(this.handleError(ChainError.api_connection_failed, err));
                });
        });
    }

    /**
     * @param callback  Callback method to handle subscription data.
     */
    public subscribeBlockApplied(callback: ChainSubscriptionCallback): Promise<Subscription> {
        return new Promise<Subscription>((resolve, reject) => {
            this.connect()
            .then(res => {
                this._chainStore.subscribeBlockApplied(callback);
                resolve(new Subscription(SubscriptionType.subscribeBlockApplied, callback));
            })
            .catch(err => {
                if (process.env.ENVIRONMENT === 'DEV') {
                    console.log(`debug => ${err}`);
                }
                reject(this.handleError(ChainError.api_connection_failed, err));
            });
        });
    }

    public unsubscribe(subscription: Subscription): boolean {
        switch (subscription.type) {
            case SubscriptionType.general: {
                return this._chainStore.unsubscribe(subscription.callback);
            }
            case SubscriptionType.subscribeBlockApplied: {
                return this._chainStore.unsubscribeBlockApplied(subscription.callback);
            }
            case SubscriptionType.subscribePendingTransactions: {
                return this._chainStore.unsubscribePendingTransaction(subscription.callback);
            }
            default:
                return false;
        }
    }

    private connect(): Promise<void> {
        return new Promise<void>(((resolve, reject) => {
            this._apiConnector
                .connection()
                .then(() => {
                    this._chainStore.init()
                        .then(() => resolve())
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        }));
    }
}
