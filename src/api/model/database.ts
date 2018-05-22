import { Asset } from '../../model/transaction';

export enum DatabaseError {
    chain_connection_failed = 'chain_connection_failed',
    chain_connecting = 'chain_connecting',
    database_execution_failed = 'database_execution_failed',
    api_connection_failed = 'api_connection_failed'
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
    static getContent = 'get_content';
    static getBuyingHistoryObjects = 'get_buying_by_consumer_URI';
    static getDynamicGlobalProperties = 'get_dynamic_global_properties';
    static getBlock = 'get_block';
    static getTransaction = 'get_transaction';
    static getAccountCount = 'get_account_count';
    static lookupMiners = 'lookup_miner_accounts';
    static getMiners = 'get_miners';
    static searchFeedback = 'search_feedback';
    static searchAccounts = 'search_accounts';
    static lookupAccounts = 'lookup_accounts';
    static searchMinerVoting = 'search_miner_voting';
    static getMinerCount = 'get_miner_count';
    static getOpenBuyings = 'get_open_buyings';
    static getOpenBuyingsByURI = 'get_open_buyings_by_URI';
    static getOpenBuyingsByConsumer = 'get_open_buyings_by_consumer';
    static getBuyingHistoryObjectsByConsumer = 'get_buying_history_objects_by_consumer';
    static getBuyingByConsumerURI = 'get_buying_by_consumer_URI';
    static listAssets = 'list_assets';
    static getAssets = 'get_assets';
    static priceToDct = 'price_to_dct';
    static getFeedsByMiner = 'get_feeds_by_miner';
    static getRealSupply = 'get_real_supply';
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

    export class ListAssets extends DatabaseOperation {
        constructor(lowerBoundSymbol: string, limit: number) {
            super(DatabaseOperationName.listAssets, lowerBoundSymbol, limit);
        }
    }

    export class GetAssets extends DatabaseOperation {
        constructor(assetIds: string[]) {
            super(DatabaseOperationName.getAssets, assetIds);
        }
    }

    export class PriceToDCT extends DatabaseOperation {
        constructor(asset: Asset) {
            super(DatabaseOperationName.priceToDct, asset);
        }
    }

    export class GetFeedsByMiner extends DatabaseOperation {
        constructor(accountId: string, limit: number) {
            super(DatabaseOperationName.getFeedsByMiner, accountId, limit);
        }
    }

    export class GetRealSupply extends DatabaseOperation {
        constructor() {
            super(DatabaseOperationName.getRealSupply);
        }
    }
}
