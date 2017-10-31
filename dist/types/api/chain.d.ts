export interface ChainMethod {
    name: string;
    param: any;
}
/**
 * Listing of methods available to be called
 * in blockchain.
 */
export declare class ChainMethods {
    static getAccount: string;
    static getAsset: string;
    static getObject: string;
    private _commands;
    readonly commands: ChainMethod[];
    add(method: string, params: any): void;
}
export declare class ChainApi {
    static asset: string;
    static asset_id: string;
    private _apiConnector;
    /**
     * Generates random sequence of bytes
     */
    static generateNonce(): string;
    static setupChain(chainId: string, chainConfig: any): void;
    constructor(apiConnector: Promise<any>);
    /**
     * Fetches data from blockchain with given chain methods.
     *
     * Returns Promise.all with resolve result as array of results
     * in order of adding into ChainMethod
     *
     * @param {ChainMethods} methods
     * @return {Promise<any[]>}
     */
    fetch(methods: ChainMethods): Promise<any[]>;
}
