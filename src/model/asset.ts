/**
 * @module Model/Asset
 */
import AssetExchangeRate = Block.AssetExchangeRate;
import {Block} from './explorer';

export interface IDCoreAssetObject extends AssetObject {
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

export class DCoreAssetObject implements IDCoreAssetObject {
    id = '';
    symbol = '';
    precision = 0;
    issuer = '';
    description = '';
    monitored_asset_opts?: MonitoredAssetOptions = null;
    options: AssetOptions = {} as AssetOptions;
    dynamic_asset_data_id = '';
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

export interface IUserIssuedAssetInfo {
    newIssuer?: string;
    description?: string;
    maxSupply?: number;
    coreExchange?: AssetExchangeRate;
    isExchangable?: boolean;
}

export class UserIssuedAssetInfo implements IUserIssuedAssetInfo {
    newIssuer?: string = null;
    description?: string = null;
    maxSupply?: number = null;
    coreExchange?: AssetExchangeRate = null;
    isExchangable?: boolean = null;
}

export interface UpdateMonitoredAssetParameters {
    issuer: string,
    asset_to_update: string,
    new_description: string,
    new_feed_lifetime_sec: number,
    new_minimum_feeds: number,
}

export interface RealSupply {
    account_balances: string;
    vesting_balances: string;
    escrows: number;
    pools: string;
}

export enum AssetError {
    unable_to_list_assets = 'unable_to_list_assets',
    api_connection_failed = 'api_connection_failed',
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    asset_issue_failure = 'asset_issue_failure',
    failed_to_fetch_account = 'failed_to_fetch_account',
    asset_not_found = 'asset_not_found',
    database_operation_failed = 'database_operation_failed',
    syntactic_error = 'syntactic_error',
    invalid_parameters = 'invalid_parameters',
}
