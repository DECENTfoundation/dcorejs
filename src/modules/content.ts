/**
 * @module ContentModule
 */
import { Asset, DCoreAccount, Account } from '../model/account';
import {
    Content,
    Seeder,
    BuyingContent,
    SubmitObject,
    ContentKeys,
    KeyPair,
    IContentExchangeObject,
    Price,
    ContentExchangeObject
} from '../model/content';
import { DatabaseApi } from '../api/database';
import { ChainApi } from '../api/chain';
import { TransactionBuilder } from '../transactionBuilder';
import { isUndefined } from 'util';
import { DatabaseOperations, SearchParams, SearchParamsOrder } from '../api/model/database';
import { ContentObject, Operation, Operations } from '../model/transaction';
import { DCoreAssetObject } from '../model/asset';
import { ApiModule } from './ApiModule';
import { Utils } from '../utils';
import { ChainMethods } from '../api/model/chain';
import { ApiConnector } from '../api/apiConnector';
import { Type } from '../model/types';
import { Validator } from './validator';

const moment = require('moment');

export enum ContentError {
    database_operation_failed = 'operation_failed',
    fetch_content_failed = 'fetch_content_failed',
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    restore_content_keys_failed = 'restore_content_keys_failed',
    asset_fetch_failed = 'asset_fetch_failed',
    asset_not_found = 'asset_not_found',
    content_not_exist = 'content_not_exist',
    account_fetch_failed = 'account_fetch_failed',
    parameters_error = 'parameters_error',
    connection_failed = 'connection_failed',
    syntactic_error = 'syntactic_error',
    content_not_bought = 'content_not_bought',
    invalid_arguments = 'invalid_arguments',
}

/**
 * ContentApi provide methods to communication
 * with content stored in DCore network.
 */
export class ContentModule extends ApiModule {
    constructor(dbApi: DatabaseApi, chainApi: ChainApi, apiConnector: ApiConnector) {
        super({
            dbApi,
            chainApi,
            apiConnector
        });
    }

    /**
     * Searches content submitted to DCore network and is not expired.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a4526e41a8bf7bc921072d11cec0c894c
     *
     * @param {SearchParams} searchParams       Parameters for content filtering.
     * @param {boolean} convertAsset            Optional parameter to convert amounts and fees of Content from blockchain asset
     *                                          amount format to right precision format of asset. Example: 100000000 => 1 DCT.
     *                                          Default: false.
     * @return {Promise<Content[]>}             List of Content object that conform search parameters.
     */
    public searchContent(searchParams?: SearchParams, convertAsset: boolean = false): Promise<Content[]> {
        if (searchParams && !Validator.validateObject(searchParams, SearchParams)
            || !Validator.validateArguments([convertAsset], [Type.boolean])) {
            throw new TypeError(ContentError.invalid_arguments);
        }
        const dbOperation = new DatabaseOperations.SearchContent(searchParams);
        return new Promise((resolve, reject) => {
            this.dbApi
                .execute(dbOperation)
                .then((content: any) => {
                    const listAssetsOp = new DatabaseOperations.ListAssets('', 100);
                    this.dbApi.execute(listAssetsOp)
                        .then((assets: DCoreAssetObject[]) => {
                            resolve(content.map((c: any) => {
                                c.synopsis = JSON.parse(c.synopsis);
                                if (c.price && convertAsset) {
                                    c = this.formatPrices(c, assets);
                                }
                                return c;
                            }));
                        })
                        .catch(err => {
                            reject(this.handleError(ContentError.database_operation_failed, err));
                        });
                })
                .catch((err: any) => {
                    reject(this.handleError(ContentError.database_operation_failed, err));
                });
        });
    }

    /**
     * Get content object from blockchain for given content id
     *
     * @param {string} id                   Id of content to get. Example: '2.13.345'
     * @param {boolean} convertAsset        Optional parameter to convert amounts and fees of Content from blockchain asset
     *                                      amount format to right precision format of asset. Example: 100000000 => 1 DCT.
     *                                      Default: false.
     * @return {Promise<Content | null>}    Content object.
     */
    public getContent(id: string, convertAsset: boolean = false): Promise<ContentObject> {
        if (!Validator.validateArguments([id, convertAsset], [Type.string, Type.boolean])) {
            throw new TypeError(ContentError.invalid_arguments);
        }
        return new Promise((resolve, reject) => {
            const listAssetsOp = new DatabaseOperations.ListAssets('', 100);
            this.dbApi.execute(listAssetsOp)
                .then((assets: DCoreAssetObject[]) => {
                    const dbOperation = new DatabaseOperations.GetObjects([id]);
                    this.dbApi
                        .execute(dbOperation)
                        .then(contents => {
                            if (!contents || !contents[0]) {
                                resolve(null);
                                return;
                            }
                            const [content] = contents;
                            const stringidied = JSON.stringify(content);
                            let objectified = JSON.parse(stringidied);
                            objectified.synopsis = JSON.parse(objectified.synopsis);
                            if (isUndefined(objectified.price['amount']) && convertAsset) {
                                objectified = this.formatPrices([objectified], assets)[0];
                            }
                            resolve(objectified as ContentObject);
                        });
                })
                .catch(err => {
                    reject(this.handleError(ContentError.database_operation_failed, err));
                });
        });
    }

    /**
     * Get content with given URI.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a1790db302a96536fe8be9794969fbfdb
     *
     * @param {string} URI                  Content URI
     * @param {boolean} convertAsset        Optional parameter to convert amounts and fees of Content from blockchain asset
     *                                      amount format to right precision format of asset. Example: 100000000 => 1 DCT.
     *                                      Default: false.
     * @returns {Promise<Content | null>}   Content object.
     */
    public getContentURI(URI: string, convertAsset: boolean = false): Promise<ContentObject | null> {
        if (!Validator.validateArguments([URI, convertAsset], [Type.string, Type.boolean])) {
            throw new TypeError(ContentError.invalid_arguments);
        }
        return new Promise((resolve, reject) => {
            const listAssetsOp = new DatabaseOperations.ListAssets('', 100);
            this.dbApi.execute(listAssetsOp)
                .then((assets: DCoreAssetObject[]) => {
                    const dbOperation = new DatabaseOperations.GetContent(URI);
                    this.dbApi
                        .execute(dbOperation)
                        .then(content => {
                            if (!content) {
                                resolve(null);
                                return;
                            }
                            const stringidied = JSON.stringify(content);
                            let objectified = JSON.parse(stringidied);
                            objectified.synopsis = JSON.parse(objectified.synopsis);
                            if (isUndefined(objectified.price['amount']) && convertAsset) {
                                objectified = this.formatPrices([objectified], assets);
                            }
                            resolve(objectified as ContentObject);
                        });
                })
                .catch(err => {
                    reject(this.handleError(ContentError.database_operation_failed, err));
                });
        });
    }

    /**
     * Cancel submitted content in blockchain.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a51951fe58f271369898d529e537bf45e
     *
     * @param {string} contentId        Content id in format '2.13.X'. Example: '2.13.1234'
     * @param {string} authorId         Author id in format'1.2.X'. Example: '1.2.345'
     * @param {string} privateKey       Author's private key to submit transaction in WIF(hex) (Wallet Import Format) format.
     * @return {Promise<void>}          Value confirming successful transaction broadcasting.
     */
    public removeContent(
        contentId: string,
        authorId: string,
        privateKey: string): Promise<void> {
        if (!Validator.validateArguments(arguments, [Type.string, Type.string, Type.string])) {
            throw new TypeError(ContentError.invalid_arguments);
        }
        return new Promise((resolve, reject) => {
            this.getContent(contentId)
                .then((content: ContentObject) => {
                    const URI = content.URI;
                    const cancelOperation = new Operations.ContentCancelOperation(authorId, URI);
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(cancelOperation);
                    transaction.broadcast(privateKey)
                        .then(() => {
                            resolve();
                        })
                        .catch(err => {
                            reject(
                                this.handleError(ContentError.transaction_broadcast_failed, err)
                            );
                        });
                })
                .catch(err => {
                    reject(this.handleError(ContentError.fetch_content_failed, err));
                });
        });
    }

    /**
     * Restores key to decrypt downloaded content.
     *
     * ElGamalPrivate contains keys used to identify if user have bought content.
     * May contains older keys, if elGamal keys pair were changed,
     * to restore content bought before keys have been changed. Otherwise content keys
     * would not be restored.
     * https://docs.decent.ch/developer/group___database_a_p_i___decent.html#gaa952f1c2adc2781d42a3f457e2d18d09
     *
     * @param {string} contentId                Content id in format '2.13.X', Example: '2.13.453'
     * @param {string} accountId                Account if in format '1.2.X'. Example: '1.2.345'
     * @param {...string[]} elGamalKeys         El Gamal keys to identify that user bought content. May contains older keys, if el gamal
     *                                          keys pair were changed, to restore content bought before keys have been changed.
     *                                          Otherwise content keys would not be restored.
     * @returns {Promise<string>}               Content key to decrypt content.
     */
    public restoreContentKeys(contentId: string, accountId: string, ...elGamalKeys: KeyPair[]): Promise<string> {
        if (!Validator.validateArguments(arguments, [Type.string, Type.string, [Array, Type.string]])) {
            throw new TypeError(ContentError.invalid_arguments);
        }
        return new Promise((resolve, reject) => {
            this.getContent(contentId)
                .then(content => {
                    const dbOperation = new DatabaseOperations.GetBuyingHistoryObjects(accountId, content.URI);
                    this.dbApi.execute(dbOperation)
                        .then(res => {
                            const validKey = elGamalKeys.find((elgPair: KeyPair) => elgPair.publicKey === res.pubKey.s);
                            if (!validKey) {
                                reject(this.handleError(ContentError.restore_content_keys_failed, 'wrong keys'));
                            }

                            const dbOperation = new DatabaseOperations.RestoreEncryptionKey(contentId, validKey.privateKey);
                            this.dbApi
                                .execute(dbOperation)
                                .then(key => {
                                    resolve(key);
                                })
                                .catch(err => {
                                    reject(this.handleError(ContentError.restore_content_keys_failed, err));
                                });
                        });
                })
                .catch(err => reject(this.handleError(ContentError.fetch_content_failed, err)));
        });
    }

    /**
     * Generate content key with key parts of each seeder to encrypt
     * content to be uploaded.
     * https://docs.decent.ch/developer/group___database_a_p_i___decent.html#ga4efd6c44e7257d496b79b102cd3d9358
     *
     * @param {string[]} seeders        Array of seeder account ids in format '1.2.X'. Example: ['1.2.12', '1.4.13']
     * @return {Promise<ContentKeys>}   Generated ContentKeys for content encryption.
     */
    public generateContentKeys(seeders: string[]): Promise<ContentKeys> {
        if (!Validator.validateArguments(arguments, [[Array, Type.string]])) {
            throw new TypeError(ContentError.invalid_arguments);
        }
        const dbOperation = new DatabaseOperations.GenerateContentKeys(seeders);
        return new Promise((resolve, reject) => {
            this.dbApi
                .execute(dbOperation)
                .then(keys => {
                    resolve(keys);
                })
                .catch(err => {
                    reject(this.handleError(ContentError.database_operation_failed, err));
                });
        });
    }

    /**
     * Submit content to blockchain
     * https://docs.decent.ch/developer/group___wallet_a_p_i___content.html#gae0af8d611b5d915264a892ad83254370
     *
     * @throws {TypeError}              Error is thrown in case of invalid input parameters.
     * @param {SubmitObject} content    SubmitObject with information about submitted object.
     * @param {string} privateKey       Private for sign transaction in WIF(hex) (Wallet Import Format) format.
     * @param {boolean} broadcast
     * @return {Promise<boolean>}       Value confirming successful transaction broadcasting.
     */
    public addContent(content: SubmitObject, privateKey: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments([content, privateKey, broadcast], [SubmitObject, Type.string, Type.boolean])) {
            throw new TypeError('Invalid parameters');
        }
        return new Promise<Operation>((resolve, reject) => {
            content.size = this.getFileSize(content.size);
            const listAssetOp = new DatabaseOperations.GetAssets([
                content.assetId || ChainApi.asset_id,
                content.publishingFeeAsset || ChainApi.asset_id
            ]);
            const methods = [new ChainMethods.GetAccount(content.authorId)];
            methods.push(...content.coAuthors.map(ca => new ChainMethods.GetAccount(ca[0])));
            this.chainApi.fetch(...methods)
                .then((accounts: DCoreAccount[]) => {
                    const authorAccount = JSON.parse(JSON.stringify(accounts[0]));
                    const coAuthors = JSON.parse(JSON.stringify(accounts))
                        .slice(1)
                        .map((coAuthor: DCoreAccount, index: number) => {
                            return [coAuthor.id, content.coAuthors[index][1]];
                        });
                    this.dbApi.execute(listAssetOp)
                        .then((assets: [DCoreAssetObject, DCoreAssetObject]) => {
                            if (!assets || !assets[0] || !assets[1]) {
                                reject(this.handleError(ContentError.fetch_content_failed));
                                return;
                            }
                            const priceAsset = assets[0];
                            const feeAsset = assets[1];
                            try {
                                const submitOperation = new Operations.SubmitContentOperation(
                                    content.size,
                                    authorAccount.id,
                                    coAuthors,
                                    content.URI,
                                    content.seeders.length,
                                    [{
                                        region: 1,
                                        price: {
                                            amount: Utils.formatAmountToAsset(content.price, priceAsset),
                                            asset_id: priceAsset.id
                                        }
                                    }],
                                    content.hash,
                                    content.seeders.map(s => s.seeder),
                                    content.keyParts,
                                    content.date.toString(),
                                    {
                                        amount: this.calculateFee(content),
                                        asset_id: feeAsset.id
                                    },
                                    JSON.stringify(content.synopsis)
                                );
                                const transaction = new TransactionBuilder();
                                transaction.addOperation(submitOperation);
                                if (broadcast) {
                                    transaction.broadcast(privateKey)
                                        .then(() => {
                                            resolve(transaction.operations[0]);
                                        })
                                        .catch(err => {
                                            reject(
                                                this.handleError(ContentError.transaction_broadcast_failed, err)
                                            );
                                        });
                                } else {
                                    resolve(transaction.operations[0]);
                                }
                            } catch (e) {
                                reject(this.handleError(ContentError.account_fetch_failed, e));
                                return;
                            }
                        })
                        .catch(err => this.handleError(ContentError.database_operation_failed, err));
                })
                .catch(err => reject(this.handleError(ContentError.account_fetch_failed, err)));
        });
    }

    /**
     * Get list of opened, not yet confirmed buy requests by seeders.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#ad4e75371b94ea3fd47cf4bd329b622aa
     *
     * @param {boolean} convertAsset            Optional parameter to convert amounts and fees of BuyingContent from blockchain asset
     *                                          amount format to right precision format of asset. Example: 100000000 => 1 DCT.
     *                                          Default: false.
     * @returns {Promise<BuyingContent[]>}      BuyingContent list of opened buy requests.
     */
    public getOpenBuying(convertAsset: boolean = false): Promise<BuyingContent[]> {
        if (!Validator.validateArguments([convertAsset], [Type.boolean])) {
            throw new TypeError('Invalid parameters');
        }
        return new Promise<BuyingContent[]>(((resolve, reject) => {
            const operation = new DatabaseOperations.GetOpenBuyings();
            this.dbApi.execute(operation)
                .then(buyingObjects => {
                    const listAssetsOp = new DatabaseOperations.ListAssets('', 100);
                    this.dbApi.execute(listAssetsOp)
                        .then((assets: DCoreAssetObject[]) => {
                            if (!assets || assets.length === 0) {
                                reject(this.handleError(ContentError.asset_fetch_failed));
                                return;
                            }
                            const result = convertAsset ? this.formatPrices(buyingObjects, assets) : buyingObjects;
                            resolve(result as BuyingContent[]);
                        })
                        .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
        }));
    }

    /**
     * Get list of opened, not yet confirmed buy requests by seeders.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a030ccb8c903503a700ecbbc87bf552af
     *
     * @param {string} URI                  Buy request URI. Example 'ipfs:QmQ9MBkzt6QcDtBhg7qenDcXtm1s6VVSogtSHa2zbXKsFb'
     * @param {boolean} convertAsset        Optional parameter to convert amounts and fees of BuyingContent from blockchain asset
     *                                      amount format to right precision format of asset. Example: 100000000 => 1 DCT.
     *                                      Default: false.
     * @returns {Promise<BuyingContent[]>}  BuyingContent list of opened buy requests.
     */
    public getOpenBuyingByURI(URI: string, convertAsset: boolean = false): Promise<BuyingContent[]> {
        if (!Validator.validateArguments([URI, convertAsset], [Type.string, Type.boolean])) {
            throw new TypeError('Invalid parameters');
        }
        return new Promise<BuyingContent[]>(((resolve, reject) => {
            const operation = new DatabaseOperations.GetOpenBuyingsByURI(URI);
            this.dbApi.execute(operation)
                .then(buyingObjects => {
                    const listAssetsOp = new DatabaseOperations.ListAssets('', 100);
                    this.dbApi.execute(listAssetsOp)
                        .then((assets: DCoreAssetObject[]) => {
                            if (!assets || assets.length === 0) {
                                reject(this.handleError(ContentError.asset_fetch_failed));
                                return;
                            }
                            const result = convertAsset ? this.formatPrices(buyingObjects, assets) : buyingObjects;
                            resolve(result as BuyingContent[]);
                        })
                        .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
        }));
    }

    /**
     * Get list of opened, not yet confirmed buy requests by seeders.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a767fc3bb252b35c33618f12083aa3064
     *
     * @param {string} accountId            Account id in format '1.2.X'. Example '1.2.345'
     * @param {boolean} convertAsset        Optional parameter to convert amounts and fees of BuyingContent from blockchain asset
     *                                      amount format to right precision format of asset. Example: 100000000 => 1 DCT.
     *                                      Default: false.
     * @returns {Promise<BuyingContent[]>}  BuyingContent list of opened buy requests.
     */
    public getOpenBuyingByConsumer(accountId: string, convertAsset: boolean = false): Promise<BuyingContent[]> {
        if (!Validator.validateArguments([accountId, convertAsset], [Type.string, Type.boolean])) {
            throw new TypeError('Invalid parameters');
        }
        return new Promise<BuyingContent[]>(((resolve, reject) => {
            const operation = new DatabaseOperations.GetOpenBuyingsByConsumer(accountId);
            this.dbApi.execute(operation)
                .then(buyingObjects => {
                    const listAssetsOp = new DatabaseOperations.ListAssets('', 100);
                    this.dbApi.execute(listAssetsOp)
                        .then((assets: DCoreAssetObject[]) => {
                            if (!assets || assets.length === 0) {
                                reject(this.handleError(ContentError.asset_fetch_failed));
                                return;
                            }
                            const result = convertAsset ? this.formatPrices(buyingObjects, assets) : buyingObjects;
                            resolve(result as BuyingContent[]);
                        })
                        .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
        }));
    }

    /**
     * Get consumer's bought content identified by URI.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a0b6a59e429592430cd91c6f8c82a5d6c
     *
     * @param {string} accountId                    Consumer's account id in format '1.2.X'. Example '1.2.345'
     * @param {string} URI                          Content URI. Example 'ipfs:QmQ9MBkzt6QcDtBhg7qenDcXtm1s6VVSogtSHa2zbXKsFb'
     * @param {boolean} convertAsset                Optional parameter to convert amounts and fees of BuyingContent from blockchain asset
     *                                              amount format to right precision format of asset. Example: 100000000 => 1 DCT.
     *                                              Default: false.
     * @returns {Promise<BuyingContent[] | null>}   List of bought content with URI.
     */
    public getBuyingByConsumerURI(accountId: string, URI: string, convertAsset: boolean = false): Promise<BuyingContent[] | null> {
        if (!Validator.validateArguments([accountId, URI, convertAsset], [Type.string, Type.string, Type.boolean])) {
            throw new TypeError('Invalid parameters');
        }
        return new Promise<BuyingContent[]>(((resolve, reject) => {
            const operation = new DatabaseOperations.GetBuyingByConsumerURI(accountId, URI);
            this.dbApi.execute(operation)
                .then(buyingObjects => {
                    const listAssetsOp = new DatabaseOperations.ListAssets('', 100);
                    this.dbApi.execute(listAssetsOp)
                        .then((assets: DCoreAssetObject[]) => {
                            if (!assets || assets.length === 0) {
                                reject(this.handleError(ContentError.asset_fetch_failed));
                                return;
                            }
                            const result = convertAsset ? this.formatPrices(buyingObjects, assets) : buyingObjects;
                            resolve(result as BuyingContent[]);
                        })
                        .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
        }));
    }

    /**
     * Bought content history of account.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a58b3b366a008ae2b0b7acd352da9969e
     *
     * @param {string} accountId            Account id in format '1.2.X'. Example '1.2.345'
     * @param {boolean} convertAsset        Optional parameter to convert amounts and fees of BuyingContent from blockchain asset
     *                                      amount format to right precision format of asset. Example: 100000000 => 1 DCT.
     *                                      Default: false.
     * @returns {Promise<BuyingContent[]>}  List of BuyingContent.
     */
    public getBuyingHistoryObjectsByConsumer(accountId: string, convertAsset: boolean = false): Promise<BuyingContent[]> {
        if (!Validator.validateArguments([accountId, convertAsset], [Type.string, Type.boolean])) {
            throw new TypeError('Invalid parameters');
        }
        return new Promise<BuyingContent[]>((resolve, reject) => {
            const getBuyingsHistoryObjectsByConsumerOp = new DatabaseOperations.GetBuyingsHistoryObjectsByConsumer(accountId);
            this.dbApi.execute(getBuyingsHistoryObjectsByConsumerOp)
                .then(buyingObjects => {
                    const listAssetsOp = new DatabaseOperations.ListAssets('', 100);
                    this.dbApi.execute(listAssetsOp)
                        .then((assets: DCoreAssetObject[]) => {
                            if (!assets || assets.length === 0) {
                                reject(this.handleError(ContentError.asset_fetch_failed));
                                return;
                            }
                            const result = convertAsset ? this.formatPrices(buyingObjects, assets) : buyingObjects;
                            resolve(result as BuyingContent[]);
                        })
                        .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
        });
    }

    /**
     * Format price Asset amounts to asset precision.
     *
     * @param {IContentExchangeObject[]} content     List of content to format.
     * @param {DCoreAssetObject[]} assets           Complete list of assets for formatting.
     * @returns {IContentExchangeObject[]}           List of content with formatted prices.
     */
    private formatPrices(content: IContentExchangeObject[], assets: DCoreAssetObject[]): IContentExchangeObject[] {
        if (!Validator.validateArray<IContentExchangeObject>(content, ContentExchangeObject)) {
            throw new TypeError(ContentError.invalid_arguments);
        }
        const result: IContentExchangeObject[] = content.map(obj => {
            const objCopy = Object.assign({}, obj);
            const assetsToFormat = [objCopy.price.hasOwnProperty('map_price')
                ? (objCopy.price as Price).map_price[0][1]
                : (objCopy.price as Asset)];
            if (objCopy.paid_price_before_exchange) {
                assetsToFormat.push(objCopy.paid_price_before_exchange);
            }
            if (objCopy.paid_price_after_exchange) {
                assetsToFormat.push(objCopy.paid_price_after_exchange);
            }
            assetsToFormat.forEach(priceAsset => {
                const asset = assets.find(a => a.id === priceAsset.asset_id);
                priceAsset.amount = Utils.formatAmountForAsset(priceAsset.amount, asset);
            });
            return objCopy;
        });
        return result;
    }

    /**
     * Calculate price of content submit for file size.
     *
     * @param fileSize  Size of file in bytes
     */
    private getFileSize(fileSize: number): number {
        return Math.ceil(fileSize / (1024 * 1024));
    }

    /**
     * Calculate submit price of content based on file size, expiration date and selected seeders.
     *
     * @param content SubmitObject for content to be uploaded
     */
    private calculateFee(content: SubmitObject): number {
        const num_days = moment(content.date).diff(moment(), 'days') + 1;
        const fee = Math.ceil(
            this.getFileSize(content.size) *
            content.seeders.reduce(
                (fee, seed) => fee + seed.price.amount * num_days,
                0
            )
        );
        return fee;
    }

    /**
     * Request buy content.
     * https://docs.decent.ch/developer/group___wallet_a_p_i___content.html#ga5c57a25ade4da4c36466bd12f4b65401
     *
     * @param {string} contentId        Id of content to be bought in format '2.13.X'. Example: '2.13.456'
     * @param {string} buyerId          Account id of user buying content in format '1.2.X'. Example: '1.2.345'
     * @param {string} elGammalPub      ElGammal public key which will be used to identify users bought content
     * @param {string} privateKey       Private key to sign broadcasted transaction in WIF(hex) (Wallet Import Format) format.
     * @param {boolean} broadcast
     * @return {Promise<boolean>}       Value confirming successful transaction broadcasting.
     */
    public buyContent(
        contentId: string,
        buyerId: string,
        elGammalPub: string,
        privateKey: string,
        broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments([contentId, buyerId, elGammalPub, privateKey, broadcast],
            [Type.string, Type.string, Type.string, Type.string, Type.boolean])
        ) {
            throw new TypeError('Invalid parameters');
        }
        return new Promise<Operation>((resolve, reject) => {
            this.getContent(contentId)
                .then((content: ContentObject) => {
                    const buyOperation = new Operations.BuyContentOperation(
                        content.URI,
                        buyerId,
                        content.price.map_price[0][1],
                        1,
                        { s: elGammalPub }
                    );
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(buyOperation);
                    if (broadcast) {
                        transaction.broadcast(privateKey)
                            .then(() => {
                                resolve(transaction.operations[0]);
                            })
                            .catch((err: any) => {
                                reject(this.handleError(ContentError.transaction_broadcast_failed, err));
                            });
                    } else {
                        resolve(transaction.operations[0]);
                    }
                })
                .catch(err => {
                    reject(this.handleError(ContentError.fetch_content_failed, err));
                });
        });
    }

    /**
     * List available seeders ordered by price.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a0fb24b59633fe48d8d4ff0bec4412f7b
     *
     * @param {number} resultSize       Number of results per request. Default 100(Max)
     * @return {Promise<Seeder[]>}      List of available Seeder objects.
     */
    public getSeeders(resultSize: number = 100): Promise<Seeder[]> {
        if (!Validator.validateArguments([resultSize], [Type.number])) {
            throw new TypeError('Invalid parameters');
        }
        const dbOperation = new DatabaseOperations.ListSeeders(resultSize);
        return new Promise((resolve, reject) => {
            this.dbApi
                .execute(dbOperation)
                .then(result => {
                    resolve(result as Seeder[]);
                })
                .catch(err => {
                    reject(this.handleError(ContentError.database_operation_failed, err));
                });
        });
    }

    /**
     * Get list of not expired purchased content for account.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a9b19baba864926274ef141c879b29e28
     *
     * @param {string} accountId        Account id in format '1.2.X'. Example: '1.2.345'
     * @param {string} order            Order of returned content list. Default is SearchParamsOrder.createdDesc
     * @param {string} startObjectId    Content object id from which list starts in format '2.13.X'. Example '2.13.234'. Default '0.0.0'
     * @param {string} term             Term to search in purchased content. Default ''
     * @param {number} resultSize       Number of results. Default 100(Max)
     * @return {Promise<Content[]>}     List of purchased content.
     */
    public getPurchasedContent(
        accountId: string,
        order: SearchParamsOrder = SearchParamsOrder.createdDesc,
        startObjectId: string = '0.0.0',
        term: string = '',
        resultSize: number = 100): Promise<Content[]> {
        if (!Validator.validateArguments(
            [accountId, order, startObjectId, term, resultSize],
            [Type.string, Type.string, Type.string, Type.string, Type.number])
        ) {
            throw new TypeError('Invalid parameters');
        }
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject('missing_parameter');
                return;
            }
            this.searchContent({count: resultSize})
                .then(allContent => {
                    const dbOperation = new DatabaseOperations.GetBoughtObjectsByCustomer(
                        accountId,
                        order,
                        startObjectId,
                        term,
                        resultSize
                    );
                    this.dbApi
                        .execute(dbOperation)
                        .then(boughtContent => {
                            const result: Content[] = [];
                            boughtContent.forEach((bought: any) => {
                                allContent.forEach(content => {
                                    if (bought.URI === content.URI) {
                                        bought.synopsis = JSON.parse(bought.synopsis);
                                        content.buy_id = bought.id;
                                        result.push(content as Content);
                                    }
                                });
                            });
                            resolve(result);
                        })
                        .catch(err => {
                            reject(
                                this.handleError(ContentError.database_operation_failed, err)
                            );
                        });
                })
                .catch(err => {
                    reject(this.handleError(ContentError.fetch_content_failed, err));
                });
        });
    }

    /**
     * List rating for given content id.
     *
     * @param {string} contentId        Content if in format '2.13.X'. Example '2.13.456'
     * @param {string} forUser          Account id to search for user's ratings for conentnt, in format '1.2.X'. Example '1.2.345'.
     * @param {string} ratingStartId    Rating id to start list from.
     * @param {number} count
     * @return {Promise<Array<Rating>>}
     */
    getRating(contentId: string, forUser: string, ratingStartId: string = '', count: number = 100): Promise<Array<BuyingContent>> {
        if (!Validator.validateArguments(
            [contentId, forUser, ratingStartId, count],
            [Type.string, Type.string, Type.string, Type.number])
        ) {
            throw new TypeError('Invalid parameters');
        }
        return new Promise<Array<BuyingContent>>((resolve, reject) => {
            this.getContent(contentId)
                .then(res => {
                    this.searchFeedback(forUser, res.URI, ratingStartId, count)
                        .then(res => resolve(res))
                        .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
                })
                .catch(err => {
                    reject(this.handleError(ContentError.fetch_content_failed, err));
                });
        });
    }

    // TODO: need to discuss with Riso
    /**
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a624e679ac58b3edfc7b817e4a46e3746
     */
    searchFeedback(accountId: string, contentURI: string, ratingStartId: string, count: number = 100): Promise<Array<BuyingContent>> {
        if (!Validator.validateArguments([accountId, contentURI, ratingStartId, count],
            [Type.string, Type.string, Type.string, Type.number])) {
            throw new TypeError(ContentError.invalid_arguments);
        }
        return new Promise<Array<BuyingContent>>(async (resolve, reject) => {
            const getAccountOp = new DatabaseOperations.GetAccounts([accountId]);
            let accounts = [];
            if (accountId) {
                try {
                    accounts = await this.dbApi.execute<Account[]>(getAccountOp);
                } catch (err) {
                    reject(this.handleError(ContentError.connection_failed, err));
                }
            }
            if (accounts.length !== 0 && !accounts[0]) {
                reject(this.handleError(ContentError.account_fetch_failed));
                return;
            }
            const [account] = accounts;
            const operation = new DatabaseOperations.SearchFeedback(account ? account.name : '', contentURI, ratingStartId, count);
            this.dbApi.execute<BuyingContent[]>(operation)
                .then((res: BuyingContent[]) => {
                    resolve(res);
                })
                .catch(err => {
                    reject(this.handleError(ContentError.database_operation_failed, err));
                });
        });
    }

    /**
     * Get author and co-authors of content.
     *
     * @param {string} URI   Content URI. Example 'ipfs:QmQ9MBkzt6QcDtBhg7qenDcXtm1s6VVSogtSHa2zbXKsFb'
     */
    getAuthorCoAuthors(URI: string): Promise<[string, string[]] | null> {
        if (!Validator.validateArguments(arguments, [Type.string])) {
            throw new TypeError('Invalid parameters');
        }
        return new Promise<[string, string[]]>((resolve, reject) => {
            const operation = new DatabaseOperations.GetContent(URI);
            this.dbApi.execute<ContentObject>(operation)
                .then((content: ContentObject) => {
                    if (!content) {
                        resolve(null);
                        return;
                    }
                    resolve([content.author, content.co_authors.map(ca => ca[0])]);
                })
                .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
        });
    }

    /**
     * Send feedback for bought content with comment.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a34d9dc81d177f87e5f501f182cf9212f
     *
     * @param {string} contentURI       Content URI. Example 'ipfs:QmQ9MBkzt6QcDtBhg7qenDcXtm1s6VVSogtSHa2zbXKsFb'
     * @param {string} consumer         Account id in format '1.2.X'. Example '1.2.345'
     * @param {string} comment          Comment for feedback.
     * @param {number} rating           Rating number from interval 1(Bad)-5(Good).
     * @param {string} consumerPKey     Account's private key to sign transaction in WIF(hex) (Wallet Import Format) format.
     * @returns {Promise<boolean>}      Value confirming successful transaction broadcasting.
     */
    leaveCommentAndRating(contentURI: string, consumer: string, comment: string, rating: number, consumerPKey: string): Promise<Operation> {
        if (!Validator.validateArguments(arguments, [Type.string, Type.string, Type.string, Type.string, Type.string])) {
            throw new TypeError(ContentError.invalid_arguments);
        }
        return new Promise<Operation>((resolve, reject) => {
            const operation = new Operations.LeaveRatingAndComment(contentURI, consumer, comment, rating);
            const transaction = new TransactionBuilder();
            transaction.addOperation(operation);
            this.apiConnector.connection()
                .then(res => {
                    transaction.broadcast(consumerPKey)
                        .then(() => resolve(transaction.operations[0]))
                        .catch((err: Error) => {
                            if (err.stack.indexOf('content != idx.end') >= 0) {
                                reject(this.handleError(ContentError.content_not_bought, err));
                            } else {
                                reject(this.handleError(ContentError.transaction_broadcast_failed, err));
                            }
                        });
                })
                .catch(err => reject(this.handleError(ContentError.connection_failed, err)));
        });
    }
}
