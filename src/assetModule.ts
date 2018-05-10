import {DatabaseApi, DatabaseOperations} from './api/database';
import {Transaction} from './transaction';
import {Block} from './explorer';
import AssetExchangeRate = Block.AssetExchangeRate;
import {ApiConnector} from './api/apiConnector';
import {Asset, Operations, PriceFeed} from './model/transaction';

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
                                 isSupplyFixed: boolean,
                                 issuerPrivateKey: string): Promise<boolean> {
        const options: AssetOptions = {
            max_supply: maxSupply,
            core_exchange_rate: coreExchangeRate,
            is_exchangeable: isExchangable,
            extensions: [[
                1, {
                    'is_fixed_max_supply': false
                }
            ]]
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

    /**
     * NOTE: only miner can create monitored asset.
     * @requires dcorejs-lib@1.1.0
     *
     * @param {string} issuer
     * @param {string} symbol
     * @param {number} precision
     * @param {string} description
     * @param {number} feedLifetimeSec
     * @param {number} minimumFeeds
     * @param {string} issuerPrivateKey
     * @returns {Promise<any>}
     */
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
            };
            const operation = new Operations.AssetCreateOperation(
                issuer, symbol, precision, description, options, monitoredOpts
            );
            console.log(operation);
            const transaction = new Transaction();
            transaction.add(operation);
            transaction.broadcast(issuerPrivateKey)
                .then(res => resolve(true))
                .catch(err => reject(err));
        });
    }

    /**
     * @requires dcorejs-lib@1.1.0
     * @returns {Promise<any>}
     */
    public issueAsset(issuer: string, assetToIssue: string, issueToAccount: string, memo: string, issuerPKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const operation = new Operations.IssueAssetOperation(
                issuer,
                {
                    asset_id: assetToIssue,
                    amount: 0
                },
                issueToAccount,
                memo || ''
            );
            const transaction = new Transaction();
            transaction.add(operation);
            transaction.broadcast(issuerPKey)
                .then(res => resolve())
                .catch(err => reject(new Error('asset_issue_failure')));
        });
    }

    public updateUserIssuedAsset(issuer: string,
                                 symbol: string,
                                 newIssuer: string,
                                 description: string,
                                 maxSupply: number,
                                 coreExchange: AssetExchangeRate,
                                 isExchangable: boolean,
                                 issuerPKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.listAssets(symbol, 1)
                .then((assetToUpdate: AssetObject[]) => {
                    if (assetToUpdate.length === 0) {
                        reject('unable_to_find_asset');
                        return;
                    }
                    const operation = new Operations.UpdateAssetIssuedOperation(
                        issuer, assetToUpdate[0].id, description, maxSupply, coreExchange, isExchangable, newIssuer
                    );
                    const transaction = new Transaction();
                    transaction.add(operation);
                    transaction.broadcast(issuerPKey)
                        .then(res => resolve(res))
                        .catch(err => reject('failed_to_broadcast_transaction'));
                })
                .catch(err => reject('failed_updating_asset'));
        });
    }

    public fundAssetPools(fromAccountId: string,
                          uiaAmount: number,
                          uiaSymbol: string,
                          dctAmount: number,
                          dctSymbol: string,
                          privateKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            Promise.all([
                this.listAssets(uiaSymbol, 1),
                this.listAssets(dctSymbol, 1)
            ])
                .then(res => {
                    const [uia, dct] = res;
                    if (!(uia[0].symbol === uiaSymbol && dct[0].symbol === dctSymbol) || res.length !== 2) {
                        reject('asset_not_found');
                        return;
                    }
                    const operation = new Operations.AssetFundPools(
                        fromAccountId,
                        {
                            asset_id: uia[0].id,
                            amount: uiaAmount
                        },
                        {
                            asset_id: dct[0].id,
                            amount: dctAmount
                        }
                    );
                    const transaction = new Transaction();
                    transaction.add(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(res))
                        .catch(err => reject('failed_to_broadcast_transaction'));
                })
                .catch(err => reject('failed_load_assets'));
        });
    }

    public assetReserve(payer: string, symbol: string, amountToReserve: number, privateKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.listAssets(symbol, 1)
                .then(res => {
                    if (res[0].symbol !== symbol || res.length !== 1) {
                        reject('asset_not_found');
                        return;
                    }
                    const operation = new Operations.AssetReserve(
                        payer,
                        {
                            asset_id: res[0].id,
                            amount: amountToReserve
                        }
                    );
                    const transaction = new Transaction();
                    transaction.add(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(res))
                        .catch(err => reject('failed_to_broadcast_transaction'));
                })
                .catch(err => reject('failed_load_assets'));
        });
    }

    public assetClaimFees(issuer: string,
                          uiaSymbol: string,
                          uiaAmount: number,
                          dctSymbol: string,
                          dctAmount: number,
                          privateKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            Promise.all([
                this.listAssets(uiaSymbol, 1),
                this.listAssets(dctSymbol, 1)
            ])
                .then(res => {
                    const [uia, dct] = res;
                    if (!(uia[0].symbol === uiaSymbol && dct[0].symbol === dctSymbol) || res.length !== 2) {
                        reject('asset_not_found');
                        return;
                    }
                    const uiaAsset: Asset = {
                        asset_id: uia[0].id,
                        amount: uiaAmount
                    };
                    const dctAsset: Asset = {
                        asset_id: dct[0].id,
                        amount: dctAmount
                    };
                    const operation = new Operations.AssetClaimFeesOperation(issuer, uiaAsset, dctAsset);
                    const transaction = new Transaction();
                    transaction.add(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(res))
                        .catch(err => reject('failed_to_broadcast_transaction'));
                })
                .catch(err => reject('failed_load_assets'));
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

    public getAssets(...assetIds: string[]): Promise<DCoreAssetObject[]> {
        const operation = new DatabaseOperations.GetAssets(assetIds);
        return new Promise<DCoreAssetObject[]>((resolve, reject) => {
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    public priceToDCT(symbol: string, amount: number): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.listAssets(symbol, 1)
                .then(res => {
                    if (res.length !== 1 || res[0].symbol !== symbol) {
                        reject('asset_not_found');
                        return;
                    }
                    const operation = new DatabaseOperations.PriceToDCT(
                        {
                            asset_id: res[0].id,
                            amount: amount
                        }
                    );
                    this.dbApi.execute(operation)
                        .then(res => resolve(res))
                        .catch(err => reject('database_operation_failed'));
                })
                .catch(err => reject('failed_load_assets'));
        });
    }

    public publishAssetFeed(publishingAccount: string,
                            symbol: string,
                            exchangeBaseAmount: number,
                            exchangeQuoteAmount: number,
                            privateKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.listAssets(symbol, 1)
                .then((asset: AssetObject[]) => {
                    if (asset.length !== 1 || asset[0].symbol !== symbol) {
                        reject('asset_not_found');
                        return;
                    }
                    const feed: PriceFeed = {
                        core_exchange_rate: {
                            quote: {
                                amount: exchangeQuoteAmount,
                                asset_id: '1.3.0'
                            },
                            base: {
                                asset_id: '',
                                amount: exchangeBaseAmount
                            }
                        }
                    };
                    const operation = new Operations.AssetPublishFeed(publishingAccount, asset[0].id, feed);
                    const transaction = new Transaction();
                    transaction.add(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(res))
                        .catch(err => reject('failed_to_broadcast_transaction'));
                })
                .catch(err => reject('failed_load_assets'));
        });
    }

    public getFeedsByMiner(minerId: string, limit: number = 100): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const operation = new DatabaseOperations.GetFeedsByMiner(minerId, limit);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject('database_operation_failed'));
        });
    }

    public getRealSupply(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const operation = new DatabaseOperations.GetRealSupply();
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject('database_operation_failed'));
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
