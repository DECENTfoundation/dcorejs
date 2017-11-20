export declare class ConnectionStatus {
    static open: string;
}
export declare class SearchParamsOrder {
    static authorAsc: string;
    static ratingAsc: string;
    static sizeAsc: string;
    static priceAsc: string;
    static createdAsc: string;
    static expirationAsc: string;
    static authorDesc: string;
    static ratingDesc: string;
    static sizeDesc: string;
    static priceDesc: string;
    static createdDesc: string;
    static expirationDesc: string;
}
export declare class SearchAccountHistoryOrder {
    static typeAsc: string;
    static toAsc: string;
    static fromAsc: string;
    static priceAsc: string;
    static feeAsc: string;
    static descriptionAsc: string;
    static timeAsc: string;
    static typeDesc: string;
    static toDesc: string;
    static fromDesc: string;
    static priceDesc: string;
    static feeDesc: string;
    static descriptionDesc: string;
    static timeDesc: string;
}
export declare class SearchParams {
    term: string;
    order: string;
    user: string;
    region_code: string;
    itemId: string;
    category: string;
    count: number;
    constructor(term?: string, order?: string, user?: string, region_code?: string, itemId?: string, category?: string, count?: number);
    readonly params: any[];
}
export declare class DatabaseError {
    static chain_connection_failed: string;
    static chain_connecting: string;
    static database_execution_failed: string;
}
export declare class DatabaseOperation {
    protected _name: string;
    protected _parameters: any[];
    readonly name: string;
    readonly parameters: any[];
    constructor(name: string, ...params: any[]);
}
export declare namespace DatabaseOperations {
    class SearchContent extends DatabaseOperation {
        constructor(searchParams: SearchParams);
    }
    class GetAccountByName extends DatabaseOperation {
        constructor(name: string);
    }
    class GetAccounts extends DatabaseOperation {
        constructor(ids: string[]);
    }
    class SearchAccountHistory extends DatabaseOperation {
        constructor(accountId: string, order: string, startObjecId?: string, limit?: number);
    }
    class GetAccountBalances extends DatabaseOperation {
        constructor(accountId: string, assetsId: string[]);
    }
    class RestoreEncryptionKey extends DatabaseOperation {
        constructor(contentId: string, elGamalPrivate: string);
    }
    class GenerateContentKeys extends DatabaseOperation {
        constructor(seeders: string[]);
    }
    class ListSeeders extends DatabaseOperation {
        constructor(resultSize: number);
    }
    class GetBoughtObjectsByCustomer extends DatabaseOperation {
        constructor(consumerId: string, order: string, startObjectId: string, term: string, resultSize: number);
    }
    class GetObjects extends DatabaseOperation {
        constructor(ids: string[]);
    }
    class GetBuyingHistoryObjects extends DatabaseOperation {
        constructor(accountId: string, contentURI: string);
    }
}
export interface DatabaseConfig {
    decent_network_wspaths: string[];
}
export declare class Database {
    protected _api: any;
}
export declare class DatabaseApi extends Database {
    protected _api: any;
    private _connectionStatus;
    private _apiConnector;
    readonly connectionStatus: string;
    static create(config: DatabaseConfig, api: any): DatabaseApi;
    private dbApi();
    constructor(config: DatabaseConfig, api: any);
    initApi(addresses: string[], forApi: any): Promise<void>;
    private connectDaemon(toApi, addresses, onSuccess, onError, addressIndex?);
    execute(operation: DatabaseOperation): Promise<any>;
    private handleError(message, err);
}
