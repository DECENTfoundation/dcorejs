import {DatabaseApi, DatabaseOperations} from './api/database';
import {Operations, Transaction} from './transaction';
import {Block} from './explorer';
import AssetExchangeRate = Block.AssetExchangeRate;
import {ApiConnector} from './api/apiConnector';

export interface AssetObject {
    id: string;
    symbol: string;
    precision: number;
    issuer: string;
    description: string;
    monitored_asset_opts: MonitoredAssetOptions;
    options: AssetOptions;
    dynamic_asset_data_id: string;
}

export interface MonitoredAssetOptions {
    feeds: any[];
    current_feed: AssetCurrentFeed;
    current_feed_publication_time: string;
    feed_lifetime_sec: number;
    minimum_feeds: number;
}

export interface AssetOptions {
    max_supply: number;
    core_exchange_rate: AssetExchangeRate;
    is_exchangeable: boolean;
    extensions?: any[];
}

export interface AssetCurrentFeed {
    core_exchange_rate: AssetExchangeRate;
}

export class AssetModule {
    public MAX_SHARED_SUPPLY = 7319777577456890;
    private dbApi: DatabaseApi;
    private connector: ApiConnector;

    constructor(dbApi: DatabaseApi, connector: ApiConnector) {
        this.dbApi = dbApi
        this.connector = connector;
    }

    public listAssets(lowerBoundSymbol: string, limit: number = 100): Promise<AssetObject[]> {
        return new Promise<any>((resolve, reject) => {
            const operation = new DatabaseOperations.ListAssets(lowerBoundSymbol, limit);
            this.dbApi.execute(operation)
                .then(res => {
                    resolve(res);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    public createUserIssuedAsset(issuer: string,
                                symbol: string,
                                precision: number,
                                description: string,
                                maxSupply: number,
                                coreExchangeRate: AssetExchangeRate,
                                isExchangable: boolean,
                                issuerPrivateKey: string): Promise<boolean> {
        const options: AssetOptions = {
            max_supply: maxSupply,
            is_exchangeable: isExchangable,
            core_exchange_rate: coreExchangeRate,
            extensions: []
        };
        const operation = new Operations.AssetCreateOperation(
            issuer, symbol, precision, description, options
        );

        const transaction = new Transaction();
        transaction.add(operation);

        return new Promise<boolean>((resolve, reject) => {
            this.connector.connect()
                .then(() => {
                    transaction.broadcast(issuerPrivateKey)
                        .then(() => resolve(true))
                        .catch(err => reject(err));
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });

        });
    }

    public getAsset(assetId: string): Promise<any> {
        const operation = new DatabaseOperations.GetAssets(assetId);
        return new Promise<any>((resolve, reject) => {
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    // TODO: add error handling
}
