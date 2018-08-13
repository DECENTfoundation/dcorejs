/**
 * @module AssetModule
 */
import { ApiConnector } from '../api/apiConnector';
import { DatabaseApi } from '../api/database';
import { DatabaseOperations } from '../api/model/database';
import { CryptoUtils } from '../crypt';
import { Asset, Memo, Operations, PriceFeed, Operation } from '../model/transaction';
import { TransactionBuilder } from '../transactionBuilder';
import { Utils } from '../utils';

import { ChainApi } from '../api/chain';
import { ApiModule } from './ApiModule';
import { ChainMethods } from '../api/model/chain';
import {
    AssetError,
    AssetObject,
    AssetOptions,
    DCoreAssetObject,
    MonitoredAssetOptions,
    RealSupply,
    UpdateMonitoredAssetParameters,
    UserIssuedAssetInfo
} from '../model/asset';
import { IProposalCreateParameters } from '../model/proposal';
import { Type } from '../model/types';
import { Validator } from './validator';


export class AssetModule extends ApiModule {
    public MAX_SHARED_SUPPLY = 7319777577456890;

    constructor(dbApi: DatabaseApi, apiConnector: ApiConnector, chainApi: ChainApi) {
        super({
            apiConnector,
            dbApi,
            chainApi
        });
    }

    /**
     *  List assets available on DCore network.
     *  https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#adaff907a467869849e77c3ac0b8beca8
     *
     * @param {string} lowerBoundSymbol     Asset symbol to start list with. Example 'DCT'
     * @param {number} limit                Number of results. Default 100(Max)
     * @param {boolean} formatAssets        Optional parameter to convert amounts and fees of AssetObject from blockchain asset
     *                                      amount format to right precision format of asset. Example: 100000000 => 1 DCT.
     *                                      Default: false.
     * @returns {AssetObject[]}             AssetObject list.
     */
    public listAssets(lowerBoundSymbol: string, limit: number = 100, formatAssets: boolean = false): Promise<AssetObject[]> {
        if (!Validator.validateArguments([lowerBoundSymbol, limit, formatAssets], [Type.string, Type.number, Type.boolean])) {
            throw new TypeError(AssetError.invalid_parameters);
        }
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

    /**
     * Create UIA(User Issued Asset).
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a3f5461005ce7d6fb69a8878a6513fe1f
     *
     * @param {string} issuer                   Issuer's account id in format '1.2.X'. Example '1.2.345'.
     * @param {string} symbol                   Symbol of newly created asset. NOTE: Price for create asset is based on number of letters.
     *                                          used in asset symbol.
     * @param {number} precision                Number of fraction digits for asset.
     * @param {string} description              Asset description. Maximum length is 1000 chars.
     * @param {number} maxSupply                The maximum supply of this asset which may exist at any given time
     * @param {number} baseExchangeAmount       Amount of custom tokens for exchange rate to quoteExchangeAmount DCT tokens.
     * @param {number} quoteExchangeAmount      Number of DCT tokens for rxchange rate.
     * @param {boolean} isExchangeable           Set 'true' to allow implicit conversion of asst to core asset.
     * @param {boolean} isSupplyFixed           Set value 'true' to fixate token maxSupply, 'false' for changeable maxSupply value.
     *                                          NOTE: only can be changed from 'false' to 'true'
     * @param {string} issuerPrivateKey         Private key to sign transaction in WIF(hex) (Wallet Import Format) format.
     * @param {boolean} broadcast               Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<boolean>}              Value confirming successful transaction broadcasting.
     */
    public createUserIssuedAsset(
        issuer: string,
        symbol: string,
        precision: number,
        description: string,
        maxSupply: number,
        baseExchangeAmount: number,
        quoteExchangeAmount: number,
        isExchangeable: boolean,
        isSupplyFixed: boolean,
        issuerPrivateKey: string,
        broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [issuer, symbol, precision, description, maxSupply, baseExchangeAmount,
                quoteExchangeAmount, isExchangeable, isSupplyFixed, issuerPrivateKey, broadcast],
            [Type.string, Type.string, Type.number, Type.string, Type.number, Type.number,
            Type.number, Type.boolean, Type.boolean, Type.string, Type.boolean])
        ) {
            throw new TypeError(AssetError.invalid_parameters);
        }
        const options: AssetOptions = {
            max_supply: maxSupply,
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
            is_exchangeable: isExchangeable,
            extensions: [[
                1, {
                    'is_fixed_max_supply': isSupplyFixed
                }
            ]]
        };
        const operation = new Operations.AssetCreateOperation(
            issuer, symbol, precision, description, options
        );
        return new Promise<Operation>((resolve, reject) => {
            this.apiConnector.connection()
                .then(() => {
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(operation);
                    this.finalizeAndBroadcast(transaction, issuerPrivateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(err => {
                    reject(this.handleError(AssetError.connection_failed, err));
                    return;
                });

        });
    }

    /**
     * Issue created custom user token to account.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a995074673211a3a6c4d94cafefd0ad56
     *
     * @param {string} assetSymbol          Asset symbol of asset to be issued. Example 'DCT'
     * @param {number} amount               Amount of asset ot be issued
     * @param {string} issueToAccount       Account id to whom asset will be issued. In format '1.2.X'. Example '1.2.345.
     * @param {string} memo                 Message for asset receiver
     * @param {string} issuerPKey           Issuer private key for transaction sign
     * @param {boolean} broadcast           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<boolean>}          Value confirming successful transaction broadcasting.
     */
    public issueAsset(
        assetSymbol: string,
        amount: number,
        issueToAccount: string,
        memo: string,
        issuerPKey: string,
        broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [assetSymbol, amount, issueToAccount, memo, issuerPKey, broadcast],
            [Type.string, Type.number, Type.string, Type.string, Type.string, Type.boolean])
        ) {
            throw new TypeError(AssetError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
            this.listAssets(assetSymbol, 1)
                .then((assets: AssetObject[]) => {
                    if (assets.length === 0 || !assets[0]) {
                        reject('asset_not_found');
                        return;
                    }
                    const asset = assets[0];
                    const issuer = asset.issuer;

                    const operations = [].concat(
                        new ChainMethods.GetAccount(issueToAccount),
                        new ChainMethods.GetAccount(issuer)
                    );
                    this.chainApi.fetch(...operations)
                        .then(res => {
                            const [issueToAcc, issuerAcc] = res;
                            const pubKeyIssuer = issuerAcc.get('options').get('memo_key');
                            const pubKeyIssueTo = issueToAcc.get('options').get('memo_key');

                            let memoObject: Memo = undefined;
                            if (memo) {
                                memoObject = {
                                    from: pubKeyIssuer,
                                    to: pubKeyIssueTo,
                                    nonce: Utils.generateNonce(),
                                    message: CryptoUtils.encryptWithChecksum(
                                        memo,
                                        issuerPKey,
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
                            const transaction = new TransactionBuilder();
                            transaction.addOperation(operation);
                            this.finalizeAndBroadcast(transaction, issuerPKey, broadcast)
                                .then(res => resolve(res))
                                .catch(err => reject(err));

                        })
                        .catch(err => {
                            reject(this.handleError(AssetError.failed_to_fetch_account, err));
                        });
                })
                .catch(err => reject(this.handleError(AssetError.unable_to_list_assets, err)));
        });
    }

    /**
     * Update information in custom token.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#af5248d111fa885580636adb468d92e16
     *
     * @param {string} symbol                   Asset symbol of updated asset. Example 'DCT'.
     * @param {UserIssuedAssetInfo} newInfo     New information for update.
     * @param {string} issuerPKey               Account private key for transaction sign.
     * @param {boolean} broadcast               Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<any>}                  Value confirming successful transaction broadcasting.
     */
    public updateUserIssuedAsset(
        symbol: string,
        newInfo: UserIssuedAssetInfo,
        issuerPKey: string,
        broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [symbol, newInfo, issuerPKey, broadcast],
            [Type.string, UserIssuedAssetInfo, Type.string, Type.boolean])
        ) {
            throw new TypeError(AssetError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
            this.listAssets(symbol, 1)
                .then((assets: AssetObject[]) => {
                    if (assets.length === 0 || !assets[0]) {
                        reject(this.handleError(AssetError.asset_not_found));
                        return;
                    }
                    const asset = assets[0];
                    let maxSupply = Number(asset.options.max_supply);
                    if (newInfo.maxSupply !== undefined) {
                        maxSupply = newInfo.maxSupply;
                    }
                    let isExchangable = asset.options.is_exchangeable;
                    if (newInfo.isExchangable !== undefined) {
                        isExchangable = newInfo.isExchangable;
                    }
                    const operation = new Operations.UpdateAssetIssuedOperation(
                        asset.issuer,
                        asset.id,
                        newInfo.description || asset.description,
                        maxSupply,
                        newInfo.coreExchange || asset.options.core_exchange_rate,
                        isExchangable,
                        newInfo.newIssuer
                    );
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(operation);
                    this.finalizeAndBroadcast(transaction, issuerPKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(err => reject(this.handleError(AssetError.unable_to_list_assets, err)));
        });
    }

    /**
     * Fund asset pools for asset exchanging.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#ab018196310aaa6118877d219d9749305
     *
     * @param {string} fromAccountId     Account id of account sending DCT asset. In format '1.2.X'. Example '1.2.345'.s
     * @param {number} uiaAmount         Amount of custom token to be send to pool.
     * @param {string} uiaSymbol         Asset symbol of custom token which pool to be funded.
     * @param {number} dctAmount         Amount of DCT token to be send to pool.
     * @param {string} dctSymbol         Asset symbol of DCT asset. Set always to 'DCT'.
     * @param {string} privateKey        Account private key used for signing transaction.
     * @param {boolean} broadcast       Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<boolean>}       Value confirming successful transaction broadcasting.
     */
    public fundAssetPools(
        fromAccountId: string,
        uiaAmount: number,
        uiaSymbol: string,
        dctAmount: number,
        privateKey: string,
        broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [fromAccountId, uiaAmount, uiaSymbol, dctAmount, privateKey, broadcast],
            [Type.string, Type.number, Type.string, Type.number, Type.string, Type.boolean])
        ) {
            throw new TypeError(AssetError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
            const dctSymbol = ChainApi.asset_id;
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
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(operation);
                    this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(err => reject(this.handleError(AssetError.unable_to_list_assets, err)));
        });
    }

    /**
     * Discard asset from network circulation.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#ae79e94dc01997493539ab0e01a505c03
     *
     * @param {string} payer            Account id in format '1.2.X'. Example '1.2.345'.
     * @param {string} symbol           Asset symbol of asset to be removed.
     * @param {number} amountToReserve  Amount of asset to be removed.
     * @param {string} privateKey       Payer's private key to sign the transaction.
     * @param {boolean} broadcast       Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<boolean>}      Value confirming successful transaction broadcasting.
     */
    public assetReserve(
        payer: string,
        symbol: string,
        amountToReserve: number,
        privateKey: string,
        broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [payer, symbol, amountToReserve, privateKey, broadcast],
            [Type.string, Type.string, Type.number, Type.string, Type.boolean])
        ) {
            throw new TypeError(AssetError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
            this.listAssets(symbol, 1)
                .then(res => {
                    if (res.length !== 1 || !res[0]) {
                        reject(this.handleError(AssetError.asset_not_found));
                        return;
                    }
                    const dynamicObject = new DatabaseOperations.GetObjects([res[0].dynamic_asset_data_id]);
                    this.dbApi.execute(dynamicObject)
                        .then(result => {
                            if (result[0].current_supply === 0) {
                                reject(this.handleError('Current supply of dynamic asset data is 0, must be greater than 0'));
                                return;
                            }
                            const operation = new Operations.AssetReserve(
                                payer,
                                {
                                    asset_id: res[0].id,
                                    amount: amountToReserve
                                }
                            );
                            const transaction = new TransactionBuilder();
                            transaction.addOperation(operation);
                            this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                                .then(res => resolve(res))
                                .catch(err => reject(err));
                        })
                        .catch();
                })
                .catch(err => reject(this.handleError(AssetError.unable_to_list_assets, err)));
        });
    }

    /**
     * Withdraw from asset pools.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#ac812b96ccef7f81ca97ebda433d98e63
     *
     * @param {string} issuer       Issuer's account id in format '1.2.X'. Example '1.2.345'.
     * @param {number} uiaAmount    Custom asset amount.
     * @param {string} uiaSymbol    Custom asset symbol.
     * @param {number} dctAmount    Amount of core DCT asset.
     * @param {string} privateKey   Issuer's private key to sign the transaction.
     * @param {boolean} broadcast       Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<boolean>}  Value confirming successful transaction broadcasting.
     */
    public assetClaimFees(
        issuer: string,
        uiaAmount: number,
        uiaSymbol: string,
        dctAmount: number,
        privateKey: string,
        broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(arguments, [Type.string, Type.number, Type.string, Type.number, Type.string])) {
            throw new TypeError(AssetError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
            const dctSymbol = ChainApi.asset_id;
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
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(operation);
                    this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(err => {
                    reject('failed_load_assets');
                });
        });
    }

    /**
     * Get asset object.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a012e918ecef1d24b2dee7ef64dca5018
     *
     * @param {string} assetId                  Asset id in format '1.3.X'. Example '1.3.0'.
     * @param {string} formatAsset              Optional parameter to convert amounts and fees of DCoreAssetObject from blockchain asset
     *                                          amount format to right precision format of asset. Example: 100000000 => 1 DCT.
     *                                          Default: false.
     * @returns {Promise<DCoreAssetObject>}     DCoreAssetObject of desired asset.
     */
    public getAsset(assetId: string, formatAsset: boolean = false): Promise<DCoreAssetObject> {
        if (!Validator.validateArguments([assetId, formatAsset], [Type.string, Type.boolean])) {
            throw new TypeError(AssetError.invalid_parameters);
        }
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

    /**
     * List of desired assets.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#ad88d6aec5d661d7f7c40a83291d78ea8
     *
     * @param {string[]} assetIds               List of asset ids to get. Example ['1.3.0', '1.3.1']
     * @param {boolean} formatAssets            Optional parameter to convert amounts and fees of DCoreAssetObject from blockchain asset
     *                                          amount format to right precision format of asset. Example: 100000000 => 1 DCT.
     *                                          Default: false.
     * @returns {Promise<DCoreAssetObject>}     DCoreAssetObject of desired asset.
     */
    public getAssets(assetIds: string[], formatAssets: boolean = false): Promise<DCoreAssetObject[]> {
        if (!Validator.validateArguments(arguments, [[Array, Type.string], Type.boolean])) {
            throw new TypeError(AssetError.invalid_parameters);
        }
        const operation = new DatabaseOperations.GetAssets(assetIds);
        return new Promise<DCoreAssetObject[]>((resolve, reject) => {
            this.dbApi.execute(operation)
                .then(res => resolve(formatAssets ? this.formatAssets(res) : res))
                .catch(err => reject(err));
        });
    }

    /**
     * Format asset to DCore DCT asset format
     *
     * @deprecated                  This method will be removed in future versions
     * @param {string} symbol       Asset symbol
     * @param {string} amount       Amount to format
     * @returns  {Promise<Asset>}   Formatted Asset object
     */
    public priceToDCT(symbol: string, amount: number): Promise<Asset> {
        if (Validator.validateArguments(arguments, [Type.string, Type.number])) {
            throw new TypeError(AssetError.invalid_parameters);
        }
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

    /**
     * Miner proposes exchange rate for monitored asset.
     * NOTE: Only active miners can.
     * https://docs.decent.ch/developer/group___wallet_a_p_i___asset.html#ga4ae6711f7d7ab2912d3e3b0a2997a8c3
     *
     * @param {string} publishingAccount
     * @param {string} symbol
     * @param {number} exchangeBaseAmount
     * @param {string} exchangeQuoteAmount
     * @param {string} privateKey
     * @param {boolean} broadcast               Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<boolean>}              Value confirming successful transaction broadcasting.
     */
    public publishAssetFeed(
        publishingAccount: string,
        symbol: string,
        exchangeBaseAmount: number,
        exchangeQuoteAmount: number,
        privateKey: string,
        broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(arguments, [Type.string, Type.string, Type.number, Type.number, Type.string])) {
            throw new TypeError(AssetError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
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
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(operation);
                    this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(err => {
                    reject(this.handleError(AssetError.unable_to_list_assets, err));
                });
        });
    }

    /**
     * List miner's proposed feeds.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a56a36fac11722644d2bdfd9552b13658
     *
     * @param {string} minerAccountId
     * @param {number} limit
     * @returns {Promise<any>}
     */
    public getFeedsByMiner(minerAccountId: string, limit: number = 100): Promise<any> {
        if (!Validator.validateArguments([minerAccountId, limit], [Type.string, Type.number])) {
            throw new TypeError(AssetError.invalid_parameters);
        }
        return new Promise<any>((resolve, reject) => {
            const operation = new DatabaseOperations.GetFeedsByMiner(minerAccountId, limit);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(AssetError.database_operation_failed, err)));
        });
    }

    /**
     * Amount of active DCT tokens in DCore network circulation.
     * @returns {Promise<any>}
     */
    public getRealSupply(): Promise<RealSupply> {
        return new Promise<RealSupply>((resolve, reject) => {
            const operation = new DatabaseOperations.GetRealSupply();
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(AssetError.database_operation_failed, err)));
        });
    }

    /**
     * Get monitored asset options of selected asset.
     * https://docs.decent.ch/developer/group___wallet_a_p_i___asset.html#ga10bc8c39c64b7fe31c0f27613162ea16
     *
     * @param {string} assetId                          Monitored asset id in format '1.3.X'. Example '1.3.45'.
     * @returns {Promise<MonitoredAssetOptions|null>}   MonitoredAssetOptions object or null if asset is not monitored
     */
    public getMonitoredAssetData(assetId: string): Promise<MonitoredAssetOptions | null> {
        if (!Validator.validateArguments(arguments, [Type.string])) {
            throw new TypeError(AssetError.invalid_parameters);
        }
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

    /**
     * Create monitored asset.
     * NOTE: only miner can create monitored asset.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a03534abbae12c7aa01ca5afb4ceb9575
     *
     * @param {string} issuer               Account id of miner who creating monitored asset. In format '1.2.X'. Example '1.2.345'.
     * @param {string} symbol               Asset symbol of newly created asset. Example 'MONAST'.
     * @param {number} precision            Number of digits on the right side of decimal point. Value needs to be lower-equal 12.
     * @param {string} description          Assets's description. Up to 1000 characters.
     * @param {number} feedLifetimeSec      Time during which is active miners feed proposals valid.
     * @param {number} minimumFeeds         Minimum number of feed proposals from miners.
     * @param {string} issuerPrivateKey     Issuer's private key to sign the transaction.
     * @param {boolean} broadcast               Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<boolean>}          Value confirming successful transaction broadcasting.
     */
    public createMonitoredAsset(
        issuer: string,
        symbol: string,
        precision: number,
        description: string,
        feedLifetimeSec: number,
        minimumFeeds: number,
        issuerPrivateKey: string,
        broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [issuer, symbol, precision, description, feedLifetimeSec, minimumFeeds, issuerPrivateKey, broadcast],
            [Type.string, Type.string, Type.number, Type.string, Type.number, Type.number, Type.string, Type.boolean]
        )
        ) {
            throw new TypeError(AssetError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
            const coreExchangeRate = {
                base: {
                    amount: 0,
                    asset_id: '1.3.0'
                },
                quote: {
                    amount: 0,
                    asset_id: '1.3.0'
                }
            };
            const options: AssetOptions = {
                max_supply: 0,
                core_exchange_rate: coreExchangeRate,
                is_exchangeable: true,
                extensions: []
            };
            const monitoredOptions: MonitoredAssetOptions = {
                feeds: [],
                current_feed: {
                    core_exchange_rate: coreExchangeRate,
                },
                current_feed_publication_time: this.convertDateToSeconds(),
                feed_lifetime_sec: feedLifetimeSec,
                minimum_feeds: minimumFeeds
            };
            const operation = new Operations.AssetCreateOperation(
                issuer, symbol, precision, description, options, monitoredOptions
            );
            const getGlobalPropertiesOperation = new DatabaseOperations.GetGlobalProperties();
            this.dbApi.execute(getGlobalPropertiesOperation)
                .then(result => {
                    const proposalCreateParameters1: IProposalCreateParameters = {
                        fee_paying_account: issuer,
                        expiration_time: this.getDate(this.convertSecondsToDays(result.parameters.miner_proposal_review_period) + 2),
                        review_period_seconds: result.parameters.miner_proposal_review_period,
                        extensions: []
                    };
                    const proposalCreateParameters2: IProposalCreateParameters = {
                        fee_paying_account: issuer,
                        expiration_time: this.getDate(this.convertSecondsToDays(result.parameters.miner_proposal_review_period) + 1),
                        review_period_seconds: result.parameters.miner_proposal_review_period,
                        extensions: []
                    };
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(operation);
                    transaction.propose(proposalCreateParameters2);
                    transaction.propose(proposalCreateParameters1);
                    this.finalizeAndBroadcast(transaction, issuerPrivateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(error => {
                    reject(this.handleError(AssetError.database_operation_failed, error));
                    return;
                });
        });
    }

    /**
     * Update information in monitored asset.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#adfa5687dce7e6cb119dd14151006e8bf
     *
     * @param {string} symbol               Asset symbol to be updated.
     * @param {string} description          New description for monitored asset. Up to 1000 characters.
     * @param {number} feedLifetimeSec      Time during which is active miners feed proposals valid.
     * @param {number} minimumFeeds         Minimum number of feed proposals from miners.
     * @param {string} privateKey           Issuer's private key to sign the transaction.
     * @param {boolean} broadcast               Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<boolean>}          Value confirming successful transaction broadcasting.
     */
    public updateMonitoredAsset(symbol: string, description: string, feedLifetimeSec: number,
        minimumFeeds: number, privateKey: string, broadcast: boolean = true):
        Promise<Operation> {
        if (!Validator.validateArguments(
            [symbol, description, feedLifetimeSec, minimumFeeds, privateKey, broadcast],
            [Type.string, Type.string, Type.number, Type.number, Type.string])
        ) {
            throw new TypeError(AssetError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
            this.listAssets(symbol, 1)
                .then((assets: AssetObject[]) => {
                    if (assets.length === 0 || !assets[0] || assets[0].symbol !== symbol) {
                        reject(this.handleError(AssetError.asset_not_found));
                        return;
                    }
                    const asset = assets[0];
                    const parameters: UpdateMonitoredAssetParameters = {
                        issuer: asset.issuer,
                        asset_to_update: asset.id,
                        new_description: description,
                        new_feed_lifetime_sec: feedLifetimeSec,
                        new_minimum_feeds: minimumFeeds,
                    };
                    const operation = new Operations.UpdateMonitoredAssetOperation(parameters);
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(operation);
                    this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(error => {
                    reject(this.handleError(AssetError.database_operation_failed, error));
                    return;
                });
        });
    }

    private convertDateToSeconds(): number {
        return new Date().getTime() / 1000 | 0;
    }

    private convertSecondsToDays(seconds: number): number {
        return seconds / 24 / 60 / 60;
    }

    private getDate(days: number = 0): string {
        const date = new Date();
        const newDate = new Date();
        newDate.setDate(date.getDate() + days);
        newDate.setUTCHours(0, 0, 0);
        return newDate.toISOString().split('.')[0];
    }

}
