import { ContentApi } from './content';
import { AccountApi } from './account';
export interface CoreConfig {
    decent_network_wspaths: string[];
    chain_id: string;
}
export declare class Core {
    private _content;
    private _account;
    private _database;
    private _chain;
    readonly content: ContentApi;
    readonly account: AccountApi;
    static create(config: CoreConfig, api?: any, chainConfigApi?: any): Core;
    private setupChain(chainId, chainConfig);
    private constructor();
}
