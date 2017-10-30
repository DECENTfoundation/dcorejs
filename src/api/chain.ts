const {FetchChain, TransactionHelper} = require('decentjs-lib/lib');

export interface ChainMethod {
    name: string
    param: any
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
        this._commands.push({name: method, param: params});
    }
}

export class ChainApi {
    static asset = 'DCT';
    public static initChain(chainId: string, chainConfig: any) {
        chainConfig.networks.decent = {
            chain_id: chainId
        };
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
    public static fetch(methods: ChainMethods): Promise<any[]> {
        const commands = methods.commands.map(op => FetchChain(op.name, op.param));
        return Promise.all(commands);
    }

    /**
     * Generates random sequence of bytes
     */
    public static generateNonce(): string {
        return TransactionHelper.unique_nonce_uint64();
    }
}
