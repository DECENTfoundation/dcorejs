import {ApiConnector} from '../api/apiConnector';
import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {CryptoUtils} from '../crypt';
import {Asset, Memo, Operations, PriceFeed} from '../model/transaction';
import {Transaction} from '../transaction';
import {Utils} from '../utils';

import {ChainApi} from '../api/chain';
import {ApiModule} from './ApiModule';
import {AssetError, AssetObject, AssetOptions, DCoreAssetObject, MonitoredAssetOptions, UserIssuedAssetInfo} from '../model/asset';
import {ChainMethods} from '../api/model/chain';

export class AssetModule extends ApiModule {
    public MAX_SHARED_SUPPLY = 7319777577456890;
    private chainApi: ChainApi;
    private connector: ApiConnector;

    constructor(dbApi: DatabaseApi, connector: ApiConnector, chainApi: ChainApi) {
        super(dbApi);
        this.chainApi = chainApi;
        this.connector = connector;
    }

    public listAssets(lowerBoundSymbol: string, limit: number = 100, formatAssets: boolean = false): Promise<AssetObject[]> {
        return new Promise<any>((resolve, reject) => {
            const operation = new DatabaseOperations.ListAssets(lowerBoundSymbol, limit);
            this.dbApi.execute(operation)
                .then((assets: DCoreAssetObject[]) => {
                    resolve(formatAssets ? this.formatAssets(assets) : assets);
                })
                .catch(err => {
                    reject(this.handleError(AssetError.unable_to_list_assets, err));
                });
        });
    }

    public createUserIssuedAsset(issuer: string,
                                 symbol: string,
                                 precision: number,
                                 description: string,
                                 maxSupply: number,
                                 baseExchangeAmount: number,
                                 quoteExchangeAmount: number,
                                 isExchangable: boolean,
                                 isSupplyFixed: boolean,
                                 issuerPrivateKey: string): Promise<boolean> {
        const options: AssetOptions = {
            max_supply: maxSupply.toString(),
            core_exchange_rate: {
                base: {
                    amount: baseExchangeAmount,
                    asset_id: '1.3.0'
                },
                quote: {
                    amount: quoteExchangeAmount,
                    asset_id: '1.3.1'
                }
            },
            is_exchangeable: isExchangable,
            extensions: [[
                1, {
                    'is_fixed_max_supply': isSupplyFixed
                }
            ]]
        };
        const operation = new Operations.AssetCreateOperation(
            issuer, symbol, precision, description, options
        );

        const transaction = new Transaction();
        transaction.addOperation(operation);

        return new Promise<boolean>((resolve, reject) => {
            this.connector.connect()
                .then(() => {
                    transaction.broadcast(issuerPrivateKey)
                        .then(() => resolve(true))
                        .catch(err => reject(this.handleError(AssetError.transaction_broadcast_failed, err)));
                })
                .catch(err => {
                    reject(this.handleError(AssetError.connection_failed, err));
                });

        });
    }

    /**
     * @requires dcorejs-lib@1.2.1 - support for asset creation
     * @returns {Promise<any>}
     */
    public issueAsset(assetSymbol: string, amount: number, issueToAccount: string, memo: string, issuerPKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.listAssets(assetSymbol, 1)
                .then((assets: AssetObject[]) => {
                    if (assets.length === 0 || !assets[0]) {
                        reject('asset_not_found');
                        return;
                    }
                    const asset = assets[0];
                    const issuer = asset.issuer;
                    // TODO: correct memo object

                    const operations = [].concat(
                        new ChainMethods.GetAccount(issueToAccount),
                        new ChainMethods.GetAccount(issuer)
                    );
                    this.chainApi.fetch(...operations)
                        .then(res => {
                            const [issueToAcc, issuerAcc] = res;
                            const privateKeyIssuer = Utils.privateKeyFromWif(issuerPKey);
                            const pubKeyIssuer = Utils.publicKeyFromString(issuerAcc.get('options').get('memo_key'));
                            const pubKeyIssueTo = Utils.publicKeyFromString(issueToAcc.get('options').get('memo_key'));

                            let memoObject: Memo = undefined;
                            if (memo) {
                                memoObject = {
                                    from: pubKeyIssuer.stringKey,
                                    to: pubKeyIssueTo.stringKey,
                                    nonce: Utils.generateNonce(),
                                    message: CryptoUtils.encryptWithChecksum(
                                        memo,
                                        privateKeyIssuer,
                                        pubKeyIssueTo,
                                        Utils.generateNonce()
                                    )
                                };
                            }
                            const operation = new Operations.IssueAssetOperation(
                                issuer,
                                {
                                    asset_id: asset.id,
                                    amount: amount
                                },
                                issueToAccount,
                                memoObject
                            );
                            const transaction = new Transaction();
                            transaction.addOperation(operation);
                            transaction.broadcast(issuerPKey)
                                .then(res => resolve(true))
                                .catch(err => {
                                    reject(this.handleError(AssetError.asset_issue_failure, err));
                                });
                        })
                        .catch(err => {
                            reject(this.handleError(AssetError.failed_to_fetch_account, err));
                        });
                })
                .catch(err => reject(this.handleError(AssetError.unable_to_list_assets, err)));
        });
    }

    public updateUserIssuedAsset(symbol: string, newInfo: UserIssuedAssetInfo, issuerPKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.listAssets(symbol, 1)
                .then((assets: AssetObject[]) => {
                    if (assets.length === 0 || !assets[0]) {
                        reject(this.handleError(AssetError.asset_not_found));
                        return;
                    }
                    const asset = assets[0];
                    const operation = new Operations.UpdateAssetIssuedOperation(
                        asset.issuer,
                        asset.id,
                        newInfo.description || asset.description,
                        Number(newInfo.maxSupply || asset.options.max_supply),
                        newInfo.coreExchange || asset.options.core_exchange_rate,
                        newInfo.isExchangable || asset.options.is_exchangeable,
                        newInfo.newIssuer
                    );
                    const transaction = new Transaction();
                    transaction.addOperation(operation);
                    transaction.broadcast(issuerPKey)
                        .then(res => resolve(true))
                        .catch(err => reject(this.handleError(AssetError.transaction_broadcast_failed, err)));
                })
                .catch(err => reject(this.handleError(AssetError.unable_to_list_assets, err)));
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
                    if (uia.length === 0 || dct.length === 0 || !uia[0] || !dct[0]) {
                        reject(this.handleError(AssetError.asset_not_found));
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
                    transaction.addOperation(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(true))
                        .catch(err => reject(this.handleError(AssetError.transaction_broadcast_failed, err)));
                })
                .catch(err => reject(this.handleError(AssetError.unable_to_list_assets, err)));
        });
    }

    public assetReserve(payer: string, symbol: string, amountToReserve: number, privateKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.listAssets(symbol, 1)
                .then(res => {
                    if (res.length !== 1 || !res[0]) {
                        reject(this.handleError(AssetError.asset_not_found));
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
                    transaction.addOperation(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(res))
                        .catch(err => reject(this.handleError(AssetError.transaction_broadcast_failed, err)));
                })
                .catch(err => reject(this.handleError(AssetError.unable_to_list_assets, err)));
        });
    }

    public assetClaimFees(issuer: string,
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
                    if (uia.length === 0 || dct.length === 0 || !uia[0] || !dct[0]) {
                        reject(this.handleError(AssetError.asset_not_found));
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
                    transaction.addOperation(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(true))
                        .catch(err => reject('failed_to_broadcast_transaction'));
                })
                .catch(err => {
                    reject('failed_load_assets');
                });
        });
    }

    public getAsset(assetId: string, formatAsset: boolean = false): Promise<DCoreAssetObject> {
        const operation = new DatabaseOperations.GetAssets([assetId]);
        return new Promise<DCoreAssetObject>((resolve, reject) => {
            this.dbApi.execute(operation)
                .then((assets: DCoreAssetObject[]) => {
                    if (!assets || !assets[0]) {
                        reject(this.handleError(AssetError.asset_not_found));
                        return;
                    }
                    resolve(formatAsset ? this.formatAssets(assets)[0] : assets[0]);
                })
                .catch(err => reject(err));
        });
    }

    public getAssets(assetIds: string[], formatAssets: boolean = false): Promise<DCoreAssetObject[]> {
        const operation = new DatabaseOperations.GetAssets(assetIds);
        return new Promise<DCoreAssetObject[]>((resolve, reject) => {
            this.dbApi.execute(operation)
                .then(res => resolve(formatAssets ? this.formatAssets(res) : res))
                .catch(err => reject(err));
        });
    }

    public priceToDCT(symbol: string, amount: number): Promise<Asset> {
        return new Promise<any>((resolve, reject) => {
            this.listAssets(symbol, 1)
                .then((assets: DCoreAssetObject[]) => {
                    if (assets.length !== 1 || !assets[0]) {
                        reject(this.handleError(AssetError.asset_not_found));
                        return;
                    }
                    const asset = assets[0];
                    const operation = new DatabaseOperations.PriceToDCT(
                        {
                            asset_id: asset.id,
                            amount: Utils.formatAmountToAsset(amount, asset)
                        }
                    );
                    this.dbApi.execute(operation)
                        .then(res => resolve(res))
                        .catch(err => reject(this.handleError(AssetError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(AssetError.unable_to_list_assets, err)));
        });
    }

    public publishAssetFeed(publishingAccount: string,
                            symbol: string,
                            exchangeBaseAmount: number,
                            exchangeQuoteAmount: number,
                            privateKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            this.listAssets(symbol, 1)
                .then((assets: AssetObject[]) => {
                    if (assets.length !== 1 || !assets[0]) {
                        reject('asset_not_found');
                        return;
                    }
                    const asset = assets[0];
                    const feed: PriceFeed = {
                        core_exchange_rate: {
                            quote: {
                                amount: exchangeQuoteAmount,
                                asset_id: '1.3.0'
                            },
                            base: {
                                asset_id: asset.id,
                                amount: exchangeBaseAmount
                            }
                        }
                    };
                    const operation = new Operations.AssetPublishFeed(publishingAccount, asset.id, feed);
                    const transaction = new Transaction();
                    transaction.addOperation(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(res))
                        .catch(err => reject(this.handleError(AssetError.transaction_broadcast_failed, err)));
                })
                .catch(err => {
                    reject(this.handleError(AssetError.unable_to_list_assets, err));
                });
        });
    }

    public getFeedsByMiner(minerAccountId: string, limit: number = 100): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const operation = new DatabaseOperations.GetFeedsByMiner(minerAccountId, limit);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(AssetError.database_operation_failed, err)));
        });
    }

    public getRealSupply(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const operation = new DatabaseOperations.GetRealSupply();
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(AssetError.database_operation_failed, err)));
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
                .catch(err => reject(this.handleError(AssetError.unable_to_list_assets, err)));
        });
    }

    private formatAssets(assets: DCoreAssetObject[]): DCoreAssetObject[] {
        const res: DCoreAssetObject[] = assets.map(asset => {
            const a = Object.assign({}, asset);
            a.options.core_exchange_rate.base.amount = asset.options.core_exchange_rate.base.amount / ChainApi.DCTPower;
            a.options.core_exchange_rate.quote.amount = Utils.formatAmountForAsset(
                asset.options.core_exchange_rate.quote.amount,
                asset
            );
            if (asset.monitored_asset_opts) {
                a.monitored_asset_opts.current_feed.core_exchange_rate.base.amount =
                    asset.options.core_exchange_rate.base.amount / ChainApi.DCTPower;
                a.monitored_asset_opts.current_feed.core_exchange_rate.quote.amount = Utils.formatAmountForAsset(
                    asset.options.core_exchange_rate.quote.amount,
                    asset
                );
            }
            return a;
        });
        return res;
    }
}
