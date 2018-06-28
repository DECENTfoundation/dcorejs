import AssetExchangeRate = Block.AssetExchangeRate;
import {Block} from './explorer';

export interface DCoreAssetObject extends AssetObject {
    dynamic_asset_data_id: string;
}

export interface AssetObject {
    id: string;
    symbol: string;
    precision: number;
    issuer: string;
    description: string;
    monitored_asset_opts?: MonitoredAssetOptions;
    options: AssetOptions;
    dynamic_asset_data_id: string;
}

export interface MonitoredAssetOptions {
    feeds?: any[];
    current_feed?: AssetCurrentFeed;
    current_feed_publication_time?: number;
    feed_lifetime_sec: number;
    minimum_feeds: number;
}

export interface AssetOptions {
    max_supply: number;
    core_exchange_rate?: AssetExchangeRate;
    is_exchangeable: boolean;
    extensions?: Array<any>;
}

export interface AssetCurrentFeed {
    core_exchange_rate: AssetExchangeRate;
}

export interface UserIssuedAssetInfo {
    newIssuer?: string;
    description?: string;
    maxSupply?: number;
    coreExchange?: AssetExchangeRate;
    isExchangable?: boolean;
}

export interface UpdateMonitoredAssetParameters {
    issuer: string,
    asset_to_update: string,
    new_description: string,
    new_feed_lifetime_sec: number,
    new_minimum_feeds: number,
}

export enum AssetError {
    unable_to_list_assets = 'unable_to_list_assets',
    connection_failed = 'connection_failed',
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    asset_issue_failure = 'asset_issue_failure',
    failed_to_fetch_account = 'failed_to_fetch_account',
    asset_not_found = 'asset_not_found',
    database_operation_failed = 'database_operation_failed',
}
