import {DatabaseApi, DatabaseOperations} from './api/database';
import {Asset} from './account';

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
    core_exchange_rate: ExchangeRate;
    is_exchangeable: boolean;
    extensions: any[];
}

export interface AssetCurrentFeed {
    core_exchange_rate: ExchangeRate;
}

export interface ExchangeRate {
    base: Asset;
    quote: Asset;
}

export class AssetModule {
    private dbApi: DatabaseApi;

    constructor(dbApi: DatabaseApi) {
        this.dbApi = dbApi;
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

    public createMonitoredAsset(issuer: string,
                                symbol: string,
                                precision: number,
                                description: string,
                                feedLifetimeSec: string,
                                minimumFeeds: string): Promise<boolean> {
        const operation = new
        return new Promise<boolean>((resolve, reject) => {});
    }
}
