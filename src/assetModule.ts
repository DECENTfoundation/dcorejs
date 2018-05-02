import {DatabaseApi, DatabaseOperations} from './api/database';
import {Operations, Transaction} from './transaction';
import {Block} from './explorer';
import AssetExchangeRate = Block.AssetExchangeRate;
import {ApiConnector} from './api/apiConnector';

export interface DCoreAssetObject extends AssetObject {
    dynamic_asset_data_id: string;
}

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
    feeds?: any[];
    current_feed?: AssetCurrentFeed;
    current_feed_publication_time?: string;
    feed_lifetime_sec: number;
    minimum_feeds: number;
}

export interface AssetOptions {
    max_supply: number;
    core_exchange_rate?: AssetExchangeRate;
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
        this.dbApi = dbApi;
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

    createMonitoredAsset(issuer: string,
                         symbol: string,
                         precision: number,
                         description: string,
                         feedLifetimeSec: number,
                         minimumFeeds: number,
                         issuerPrivateKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const options: AssetOptions = {
                max_supply: 7319777577456890,
                is_exchangeable: true,
                extensions: []
            };
            const monitoredOpts: MonitoredAssetOptions = {
                feed_lifetime_sec: feedLifetimeSec,
                minimum_feeds: minimumFeeds
            }
            const operation = new Operations.AssetCreateOperation(
                issuer, symbol, precision, description, options, monitoredOpts
            );
            const transaction = new Transaction();
            transaction.add(operation);
            transaction.broadcast(issuerPrivateKey)
                .then(res => resolve(true))
                .catch(err => reject(err));
        });
    }

    public getAsset(assetId: string): Promise<DCoreAssetObject[]> {
        const operation = new DatabaseOperations.GetAssets([assetId]);
        return new Promise<DCoreAssetObject[]>((resolve, reject) => {
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    public getMonitoredAssetData(assetId: string): Promise<MonitoredAssetOptions | null> {
        const operation = new DatabaseOperations.GetAssets([assetId]);
        return new Promise<MonitoredAssetOptions>((resolve, reject) => {
            this.dbApi.execute(operation)
                .then((res: AssetObject[]) => {
                    if (res.length === 0) {
                        resolve(null);
                        return;
                    }

                    if (!('monitored_asset_opts' in res[0])) {
                        resolve(null);
                        return;
                    }
                    resolve(res[0].monitored_asset_opts);
                })
                .catch(err => reject(err));
        });
    }

    // TODO: add error handling
}
