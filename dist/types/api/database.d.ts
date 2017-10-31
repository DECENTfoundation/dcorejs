export declare class ConnectionStatus {
    static open: string;
}
export declare class DatabaseError {
    static chain_connection_failed: string;
    static chain_connecting: string;
    static database_execution_failed: string;
}
export declare class DatabaseOperation {
    static searchContent: string;
    static getAccountByName: string;
    static getAccounts: string;
    static searchAccountHistory: string;
    static getAccountBalances: string;
    static generateContentKeys: string;
    static restoreEncryptionKey: string;
}
export interface DatabaseConfig {
    decent_network_wspaths: string[];
}
export declare class Database {
    protected _api: any;
}
export declare class DatabaseApi extends Database {
    private _config;
    protected _api: any;
    private _connectionStatus;
    private _apiConnector;
    static create(config: DatabaseConfig, api: any, chainStore: any): DatabaseApi;
    private dbApi();
    constructor(config: DatabaseConfig, api: any, chainStore: any);
    initApi(addresses: string[], forApi: any): Promise<any>;
    private connectDaemon(toApi, addresses, onSuccess, onError, addressIndex?);
    execute(operation: DatabaseOperation, parameters: any[]): Promise<any>;
}
