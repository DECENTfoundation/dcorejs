export enum DatabaseError {
    chain_connection_failed = 'chain_connection_failed',
    chain_connecting = 'chain_connecting',
    database_execution_failed = 'database_execution_failed',
    api_connection_failed = 'api_connection_failed'
}

export enum DatabaseOperationName {
    getAccountByName = 'get_account_by_name',
    searchContent = 'search_content',
    getAccounts = 'get_accounts',
    searchAccountHistory = 'search_account_history',
    getAccountBalances = 'get_account_balances',
    generateContentKeys = 'generate_content_keys',
    restoreEncryptionKey = 'restore_encryption_key',
    getBuyingObjectsByConsumer = 'get_buying_objects_by_consumer',
    listPublishers = 'list_seeders_by_price',
    getObjects = 'get_objects',
    getContent = 'get_content',
    getBuyingHistoryObjects = 'get_buying_by_consumer_URI',
    getDynamicGlobalProperties = 'get_dynamic_global_properties',
    getBlock = 'get_block',
    getTransaction = 'get_transaction',
    getAccountCount = 'get_account_count',
    lookupMiners = 'lookup_miner_accounts',
    getMiners = 'get_miners',
    searchFeedback = 'search_feedback',
    searchAccounts = 'search_accounts',
    lookupAccounts = 'lookup_accounts',
    searchMinerVoting = 'search_miner_voting',
    getMinerCount = 'get_miner_count',
    getOpenBuyings = 'get_open_buyings',
    getOpenBuyingsByURI = 'get_open_buyings_by_URI',
    getOpenBuyingsByConsumer = 'get_open_buyings_by_consumer',
    getBuyingHistoryObjectsByConsumer = 'get_buying_history_objects_by_consumer',
    getBuyingByConsumerURI = 'get_buying_by_consumer_URI',
    listActiveSubscriptionsByConsumer = 'list_active_subscriptions_by_consumer',
    listSeedersByUpload = 'list_seeders_by_upload',
    listSeedersByRegion = 'list_seeders_by_region',
    listSeedersByRating = 'list_seeders_by_rating',
    getVestingBalances = 'get_vesting_balances',
}

export class DatabaseOperation {
    protected _name: DatabaseOperationName;
    protected _parameters: any[];

    get name(): string {
        return this._name;
    }

    get parameters(): any[] {
        return this._parameters;
    }

    constructor(name: DatabaseOperationName, ...params: any[]) {
        this._name = name;
        this._parameters = params;
    }
}

export enum SearchParamsOrder {
    authorAsc = '+author',
    ratingAsc = '+rating',
    sizeAsc = '+size',
    priceAsc = '+price',
    createdAsc = '+created',
    expirationAsc = '+expiration',
    authorDesc = '-author',
    ratingDesc = '-rating',
    sizeDesc = '-size',
    priceDesc = '-price',
    createdDesc = '-created',
    expirationDesc = '-expiration',
}

export enum SearchAccountHistoryOrder {
    typeAsc = '+type',
    toAsc = '+to',
    fromAsc = '+from',
    priceAsc = '+price',
    feeAsc = '+fee',
    descriptionAsc = '+description',
    timeAsc = '+time',
    typeDesc = '-type',
    toDesc = '-to',
    fromDesc = '-from',
    priceDesc = '-price',
    feeDesc = '-fee',
    descriptionDesc = '-description',
    timeDesc = '-time',
}

export enum MinerOrder {
    nameAsc = '+name',
    urlAsc = '+url',
    votesAsc = '+votes',
    nameDesc = '-name',
    urlDesc = '-url',
    votesDesc = '-votes',
    none = ''
}

/**
 * Parameters for content search.
 * Order parameter options can be found in SearchParamsOrder class, Default: SearchParamsOrder.createdDesc
 * Region code is ISO 3166-1 alpha-2 two-letter region code.
 */
export interface SearchParams {
    term?: string;
    order?: string;
    /**
     * Content owner
     * @memberof SearchParams
     */
    user?: string;
    region_code?: string;
    itemId?: string;
    category?: string;
    count?: number;
}

export namespace DatabaseOperations {
    export class SearchContent extends DatabaseOperation {
        constructor(searchParams: SearchParams) {
            super(
                DatabaseOperationName.searchContent,
                searchParams.term || '',
                searchParams.order || '',
                searchParams.user || '',
                searchParams.region_code || '',
                searchParams.itemId || '0.0.0',
                searchParams.category || '1',
                searchParams.count || 100
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

    export class GetContent extends DatabaseOperation {
        constructor(URI: string) {
            super(DatabaseOperationName.getContent, URI);
        }
    }

    export class GetBuyingHistoryObjects extends DatabaseOperation {
        constructor(accountId: string, contentURI: string) {
            super(DatabaseOperationName.getBuyingHistoryObjects, accountId, contentURI);
        }
    }

    export class GetDynamicGlobalProperties extends DatabaseOperation {
        constructor() {
            super(DatabaseOperationName.getDynamicGlobalProperties);
        }
    }

    export class GetBlock extends DatabaseOperation {
        constructor(blockId: number) {
            super(DatabaseOperationName.getBlock, blockId);
        }
    }

    export class GetTransaction extends DatabaseOperation {
        constructor(blockId: number, txNumber: number) {
            super(DatabaseOperationName.getTransaction, blockId, txNumber);
        }
    }

    export class GetAccountCount extends DatabaseOperation {
        constructor() {
            super(DatabaseOperationName.getAccountCount);
        }
    }

    export class LookupMiners extends DatabaseOperation {
        constructor(startFrom: string, limit: number) {
            super(DatabaseOperationName.lookupMiners, startFrom, limit);
        }
    }

    export class GetMiners extends DatabaseOperation {
        constructor(minerIds: string[]) {
            super(DatabaseOperationName.getMiners, minerIds);
        }
    }

    export class SearchFeedback extends DatabaseOperation {
        constructor(accountId: string, contentUri: string, startId: string, count: number) {
            super(DatabaseOperationName.searchFeedback, accountId, contentUri, startId, count);
        }
    }

    export class SearchAccounts extends DatabaseOperation {
        constructor(searchTerm: string, order: string, id: string, limit: number) {
            super(DatabaseOperationName.searchAccounts, searchTerm, order, id, limit);
        }
    }

    export class LookupAccounts extends DatabaseOperation {
        constructor(lowerBound: string, limit: number) {
            super(DatabaseOperationName.lookupAccounts, lowerBound, limit);
        }
    }

    export class SearchMinerVoting extends DatabaseOperation {
        constructor(accountName: string, keyword: string, myVotes: boolean, sort: MinerOrder, fromMinerId: string, limit: number) {
            super(DatabaseOperationName.searchMinerVoting, accountName, keyword, myVotes, sort, fromMinerId, limit);
        }
    }

    export class GetMinerCount extends DatabaseOperation {
        constructor() {
            super(DatabaseOperationName.getMinerCount);
        }
    }

    export class GetOpenBuyings extends DatabaseOperation {
        constructor() {
            super(DatabaseOperationName.getOpenBuyings);
        }
    }

    export class GetOpenBuyingsByURI extends DatabaseOperation {
        constructor(URI: string) {
            super(DatabaseOperationName.getOpenBuyingsByURI, URI);
        }
    }

    export class GetOpenBuyingsByConsumer extends DatabaseOperation {
        constructor(accountId: string) {
            super(DatabaseOperationName.getOpenBuyingsByConsumer, accountId);
        }
    }

    export class GetBuyingsHistoryObjectsByConsumer extends DatabaseOperation {
        constructor(accountId: string) {
            super(DatabaseOperationName.getBuyingHistoryObjectsByConsumer, accountId);
        }
    }

    export class GetBuyingByConsumerURI extends DatabaseOperation {
        constructor(accountId: string, URI: string) {
            super(DatabaseOperationName.getBuyingByConsumerURI, accountId, URI);
        }
    }

    export class GetVestingBalances extends DatabaseOperation {
        constructor(accountId: string) {
            super(DatabaseOperationName.getVestingBalances, accountId);
        }
    }

    export class ListActiveSubscriptionsByConsumer extends DatabaseOperation {
        constructor(accountId: string, limit: number) {
            super(DatabaseOperationName.listActiveSubscriptionsByConsumer, accountId, limit);
        }
    }

    export class ListSeedersByUpload extends DatabaseOperation {
        constructor(limit: number) {
            super(DatabaseOperationName.listSeedersByUpload, limit);
        }
    }

    export class ListSeedersByRegion extends DatabaseOperation {
        constructor(region: string) {
            super(DatabaseOperationName.listSeedersByRegion, region);
        }
    }

    export class ListSeedersByRating extends DatabaseOperation {
        constructor(limit: number) {
            super(DatabaseOperationName.listSeedersByRating, limit);
        }
    }
}
