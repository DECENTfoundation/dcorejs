const BBPromise = require('bluebird');

export class ConnectionStatus {
    static open = 'open';
}

export class SearchParamsOrder {
    static authorAsc = '+author';
    static ratingAsc = '+rating';
    static sizeAsc = '+size';
    static priceAsc = '+price';
    static createdAsc = '+created';
    static expirationAsc = '+expiration';
    static authorDesc = '-author';
    static ratingDesc = '-rating';
    static sizeDesc = '-size';
    static priceDesc = '-price';
    static createdDesc = '-created';
    static expirationDesc = '-expiration';
}

export class SearchAccountHistoryOrder {
    static typeAsc = '+type';
    static toAsc = '+to';
    static fromAsc = '+from';
    static priceAsc = '+price';
    static feeAsc = '+fee';
    static descriptionAsc = '+description';
    static timeAsc = '+time';
    static typeDesc = '-type';
    static toDesc = '-to';
    static fromDesc = '-from';
    static priceDesc = '-price';
    static feeDesc = '-fee';
    static descriptionDesc = '-description';
    static timeDesc = '-time';
}

/**
 * Parameters for content search.
 * Order parameter options can be found in SearchParamsOrder class, Default: SearchParamsOrder.createdDesc
 * Region code is ISO 3166-1 alpha-2 two-letter region code.
 */
export class SearchParams {
    term = '';
    order = '';
    /**
     * Content owner
     * @memberof SearchParams
     */
    user = '';
    region_code = '';
    itemId = '';
    category = '';
    count: number;

    constructor(term = '',
                order = '',
                user = '',
                region_code = '',
                itemId = '',
                category: string = '',
                count: number = 6) {
        this.term = term || '';
        this.order = order || SearchParamsOrder.createdDesc;
        this.user = user || '';
        this.region_code = region_code || '';
        this.itemId = itemId || '0.0.0';
        this.category = category || '1';
        this.count = count || 6;
    }

    get params(): any[] {
        let params: any[] = [];
        params = Object.values(this).reduce((previousValue, currentValue) => {
            previousValue.push(currentValue);
            return previousValue;
        }, params);
        return params;
    }
}

export class DatabaseError {
    static chain_connection_failed = 'chain_connection_failed';
    static chain_connecting = 'chain_connecting';
    static database_execution_failed = 'database_execution_failed';
}

class DatabaseOperationName {
    static searchContent = 'search_content';
    static getAccountByName = 'get_account_by_name';
    static getAccounts = 'get_accounts';
    static searchAccountHistory = 'search_account_history';
    static getAccountBalances = 'get_account_balances';
    static generateContentKeys = 'generate_content_keys';
    static restoreEncryptionKey = 'restore_encryption_key';
    static getBuyingObjectsByConsumer = 'get_buying_objects_by_consumer';
    static listPublishers = 'list_seeders_by_price';
    static getObjects = 'get_objects';
    static getBuyingHistoryObjects = 'get_buying_by_consumer_URI';
}

export class DatabaseOperation {
    protected _name: string;
    protected _parameters: any[];

    get name(): string {
        return this._name;
    }

    get parameters(): any[] {
        return this._parameters;
    }

    constructor(name: string, ...params: any[]) {
        this._name = name;
        this._parameters = params;
    }
}

export namespace DatabaseOperations {
    export class SearchContent extends DatabaseOperation {
        constructor(searchParams: SearchParams) {
            const [
                term,
                order,
                user,
                region_code,
                itemId,
                category,
                count
            ] = searchParams.params;
            super(
                DatabaseOperationName.searchContent,
                term,
                order,
                user,
                region_code,
                itemId,
                category,
                count
            );
        }
    }

    export class GetAccountByName extends DatabaseOperation {
        constructor(name: string) {
            super(DatabaseOperationName.getAccountByName, name);
        }
    }

    export class GetAccounts extends DatabaseOperation {
        constructor(ids: string[]) {
            super(DatabaseOperationName.getAccounts, ids);
        }
    }

    export class SearchAccountHistory extends DatabaseOperation {
        constructor(accountId: string,
                    order: string,
                    startObjecId: string = '0.0.0',
                    limit = 100) {
            super(
                DatabaseOperationName.searchAccountHistory,
                accountId,
                order,
                startObjecId,
                limit
            );
        }
    }

    export class GetAccountBalances extends DatabaseOperation {
        constructor(accountId: string, assetsId: string[]) {
            super(DatabaseOperationName.getAccountBalances, accountId, assetsId);
        }
    }

    export class RestoreEncryptionKey extends DatabaseOperation {
        constructor(contentId: string, elGamalPrivate: string) {
            super(
                DatabaseOperationName.restoreEncryptionKey,
                {s: elGamalPrivate},
                contentId
            );
        }
    }

    export class GenerateContentKeys extends DatabaseOperation {
        constructor(seeders: string[]) {
            super(DatabaseOperationName.generateContentKeys, seeders);
        }
    }

    export class ListSeeders extends DatabaseOperation {
        constructor(resultSize: number) {
            super(DatabaseOperationName.listPublishers, resultSize);
        }
    }

    export class GetBoughtObjectsByCustomer extends DatabaseOperation {
        constructor(consumerId: string,
                    order: string,
                    startObjectId: string,
                    term: string,
                    resultSize: number) {
            super(
                DatabaseOperationName.getBuyingObjectsByConsumer,
                consumerId,
                order,
                startObjectId,
                term,
                resultSize
            );
        }
    }

    export class GetObjects extends DatabaseOperation {
        constructor(ids: string[]) {
            super(DatabaseOperationName.getObjects, ids);
        }
    }

    export class GetBuyingHistoryObjects extends DatabaseOperation {
        constructor(accountId: string, contentURI: string) {
            super(DatabaseOperationName.getBuyingHistoryObjects, accountId, contentURI);
        }
    }
}

export interface DatabaseConfig {
    decent_network_wspaths: string[];
}

export class Database {
    protected _api: any;
}

export class DatabaseApi extends Database {
    protected _api: any;
    private _connectionStatus: string;
    private _apiConnector: Promise<void>;
    private _config: DatabaseConfig;

    get connectionStatus(): string {
        return this._connectionStatus;
    }

    public static create(config: DatabaseConfig, api: any): DatabaseApi {
        return new DatabaseApi(config, api);
    }

    private dbApi(): any {
        return this._api.instance().db_api();
    }

    constructor(config: DatabaseConfig, api: any) {
        super();
        this._api = api;
        this._config = config;
    }

    public initApi(): Promise<void> {
        // TODO: when not connected yet, calls throws errors
        this._api.setRpcConnectionStatusCallback((status: any) => {
            this._connectionStatus = status;
        });

        const promises: Promise<any>[] = [];
        this._config.decent_network_wspaths.forEach(address => {
            promises.push(this.getConnectionPromise(address, this._api));
        });

        this._apiConnector = BBPromise.any(promises);
        return this._apiConnector;
    }

    private getConnectionPromise(forAddress: string, toApi: any): Promise<any> {
        return toApi.instance(forAddress, true).init_promise;
    }

    public execute(operation: DatabaseOperation): Promise<any> {
        return new Promise((resolve, reject) => {
            this._apiConnector.then(() => {
                this.dbApi()
                    .exec(operation.name, operation.parameters)
                    .then((content: any) => resolve(content))
                    .catch((err: any) => {
                        reject(
                            this.handleError(DatabaseError.database_execution_failed, err)
                        );
                    });
            });
        });
    }

    private handleError(message: string, err: any): Error {
        const error = new Error(message);
        error.stack = err;
        return error;
    }
}
