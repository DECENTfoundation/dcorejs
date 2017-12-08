import { DecentLib } from '../helpers';


export class ChainError {
    static command_execution_failed = 'command_execution_failed';
}

export interface ChainMethod {
    name: string;
    param: any;
}

/**
 * Listing of methods available to be called
 * in blockchain.
 */
export class ChainMethods {
    static getAccount = 'getAccount';
    static getAsset = 'getAsset';
    static getObject = 'getObject';

    private _commands: ChainMethod[] = [];
    get commands(): ChainMethod[] {
        return this._commands;
    }

    add(method: string, params: any) {
        this._commands.push({ name: method, param: params });
    }
}

export class ChainApi {

    static asset = 'DCT';
    static asset_id = '1.3.0';
    static DCTPower = Math.pow(10, 8);
    private _apiConnector: Promise<void>;
    private _chainStore: any;

    /**
     * Generates random sequence of bytes
     */
    public static generateNonce(): string {
        return DecentLib.TransactionHelper.unique_nonce_uint64();
    }

    public static setupChain(chainId: string, chainConfig: any) {
        chainConfig.networks.decent = {
            chain_id: chainId
        };
    }

    constructor(apiConnector: Promise<void>, chainStore: any) {
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
    public fetch(methods: ChainMethods): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this._apiConnector
            .then(() => {
                this._chainStore.init()
                .then(() => {
                    const commands = methods.commands
                        .map(op => DecentLib.FetchChain(op.name, op.param));
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
            })
            .catch(err => {
                reject(err);
            });
        });
    }
}
