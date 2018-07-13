import {dcorejs_lib} from '../helpers';
import {ApiConnector} from './apiConnector';
import {ChainError, ChainSubscriptionCallback, Method} from './model/chain';

export class ChainApi {

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
                            const e = new Error(ChainError.command_execution_failed);
                            e.stack = err;
                            reject(e);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    public subscribe(callback: ChainSubscriptionCallback) {
        this.connect()
            .then(res => {
                this._chainStore.subscribe(callback);
            })
            .catch(err => console.log(err));
    }

    public subscribePendingTransactions(callback: ChainSubscriptionCallback) {
        this.connect()
            .then(res => {
                this._chainStore.subscribePendingTransaction(callback);
            })
            .catch(err => console.log(err));
    }

    public subscribeBlockApplied(callback: ChainSubscriptionCallback) {
        this.connect()
            .then(res => {
                this._chainStore.subscribeBlockApplied(callback);
            })
            .catch(err => console.log(err));
    }

    private connect(): Promise<void> {
        return new Promise<void>(((resolve, reject) => {
            this._apiConnector
                .connect()
                .then(() => {
                    this._chainStore.init()
                        .then(() => resolve())
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        }));
    }
}
