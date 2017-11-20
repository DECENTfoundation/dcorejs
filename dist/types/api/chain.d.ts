export declare class ChainError {
    static command_execution_failed: string;
}
export interface ChainMethod {
    name: string;
    param: any;
}
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
    static DCTPower: number;
    private _apiConnector;
    static generateNonce(): string;
    static setupChain(chainId: string, chainConfig: any): void;
    constructor(apiConnector: Promise<void>);
    fetch(methods: ChainMethods): Promise<any[]>;
}
