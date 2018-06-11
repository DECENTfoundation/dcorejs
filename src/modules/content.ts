import {Rating, Content, Seeder, BuyingContent, SubmitObject, ContentKeys, KeyPair, ContentExchangeObject} from '../model/content';
import {DatabaseApi} from '../api/database';
import {ChainApi, ChainMethods} from '../api/chain';
import {Transaction} from '../transaction';
import {isUndefined} from 'util';
import {DatabaseOperations, SearchParams, SearchParamsOrder} from '../api/model/database';
import {ContentObject, Operations} from '../model/transaction';
import {DCoreAssetObject} from '../model/asset';
import {ApiModule} from './ApiModule';
import {Utils} from '../utils';

const moment = require('moment');

export enum ContentError {
    database_operation_failed = 'operation_failed',
    fetch_content_failed = 'fetch_content_failed',
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    restore_content_keys_failed = 'restore_content_keys_failed',
    asset_fetch_failed = 'asset_fetch_failed',
    asset_not_found = 'asset_not_found'
}

/**
 * ContentApi provide methods to communication
 * with content stored in dcore_js network.
 */
export class ContentApi extends ApiModule {
    constructor(dbApi: DatabaseApi) {
        super(dbApi);
    }

    /**
     * Searches content submitted to dcore_js network and is not expired.
     *
     * @param {SearchParams} searchParams
     * @param {boolean} convertAsset
     * @return {Promise<Content[]>}
     */
    public searchContent(searchParams?: SearchParams, convertAsset: boolean = false): Promise<Content[]> {
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
                        .catch(err => console.log(err));
                })
                .catch((err: any) => {
                    reject(this.handleError(ContentError.database_operation_failed, err));
                });
        });
    }

    /**
     * Fetch content object from blockchain for given content id
     *
     * @param {string} id example: '1.2.345'
     * @param {boolean} convertAsset
     * @return {Promise<Content>}
     */
    public getContent(id: string, convertAsset: boolean = false): Promise<Content> {
        return new Promise((resolve, reject) => {
            const listAssetsOp = new DatabaseOperations.ListAssets('', 100);
            this.dbApi.execute(listAssetsOp)
                .then((assets: DCoreAssetObject[]) => {
                    const dbOperation = new DatabaseOperations.GetObjects([id]);
                    this.dbApi
                        .execute(dbOperation)
                        .then(contents => {
                            const [content] = contents;
                            const stringidied = JSON.stringify(content);
                            let objectified = JSON.parse(stringidied);
                            objectified.synopsis = JSON.parse(objectified.synopsis);
                            if (isUndefined(objectified.price['amount']) && convertAsset) {
                                objectified = this.formatPrices([objectified], assets)[0];
                            }
                            resolve(objectified as Content);
                        });
                })
                .catch(err => {
                    reject(this.handleError(ContentError.database_operation_failed, err));
                });
        });
    }

    /**
     *
     * @param {string} URI
     * @param {boolean} convertAsset
     * @returns {Promise<Content | null>}
     */
    public getContentURI(URI: string, convertAsset: boolean = false): Promise<Content | null> {
        return new Promise((resolve, reject) => {
            const listAssetsOp = new DatabaseOperations.ListAssets('', 100);
            this.dbApi.execute(listAssetsOp)
                .then((assets: DCoreAssetObject[]) => {
                    const dbOperation = new DatabaseOperations.GetContent(URI);
                    this.dbApi
                        .execute(dbOperation)
                        .then(contents => {
                            if (!contents) {
                                resolve(null);
                                return;
                            }
                            const [content] = contents;
                            const stringidied = JSON.stringify(content);
                            let objectified = JSON.parse(stringidied);
                            objectified.synopsis = JSON.parse(objectified.synopsis);
                            if (isUndefined(objectified.price['amount']) && convertAsset) {
                                objectified = this.formatPrices([objectified], assets);
                            }
                            resolve(objectified as Content);
                        });
                })
                .catch(err => {
                    reject(this.handleError(ContentError.database_operation_failed, err));
                });
        });
    }

    /**
     * Cancel submitted content record from blockchain.
     *
     * @param {string} contentId example: '2.13.1234'
     * @param {string} authorId example: '1.2.532'
     * @param {string} privateKey
     * @return {Promise<void>}
     */
    public removeContent(contentId: string,
                         authorId: string,
                         privateKey: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.getContent(contentId)
                .then((content: Content) => {
                    const URI = content.URI;
                    const methods = new ChainMethods();
                    methods.add(ChainMethods.getAccount, authorId);

                    const cancelOperation = new Operations.ContentCancelOperation(authorId, URI);
                    const transaction = new Transaction();
                    transaction.add(cancelOperation);
                    transaction
                        .broadcast(privateKey)
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
     *
     * @param {string} contentId                example: '1.2.453'
     * @param {string} accountId                example: '1.2.453'
     * @param {...string[]} elGamalKeys
     * @returns {Promise<string>}
     * @memberof ContentApi
     */
    public restoreContentKeys(contentId: string, accountId: string, ...elGamalKeys: KeyPair[]): Promise<string> {
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
     * Obtains content key with key parts of each seeder to encrypt
     * content to be uploaded.
     *
     * @param {string[]} seeders Array of seeders ids example: ['1.2.12', '1.4.13']
     * @return {Promise<ContentKeys>}
     */
    public generateContentKeys(seeders: string[]): Promise<ContentKeys> {
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
     * Need to supply control checksum 'ripemdHash' and
     * 'key' generated by seeders in getContentKeys
     *
     * @param {SubmitObject} content
     * @param {string} privateKey
     * @return {Promise<void>}
     */
    public addContent(content: SubmitObject, privateKey: string): Promise<void> {
        return new Promise((resolve, reject) => {
            content.size = this.getFileSize(content.size);
            const listAssetOp = new DatabaseOperations.GetAssets([
                content.assetId || ChainApi.asset_id,
                content.publishingFeeAsset || ChainApi.asset_id
            ]);
            this.dbApi.execute(listAssetOp)
                .then((assets: [DCoreAssetObject, DCoreAssetObject]) => {
                    if (!assets || !assets[0] || !assets[1]) {
                        reject(this.handleError(ContentError.fetch_content_failed));
                        return;
                    }
                    const priceAsset = assets[0];
                    const feeAsset = assets[1];
                    const submitOperation = new Operations.SubmitContentOperation(
                        content.size,
                        content.authorId,
                        content.coAuthors,
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
                    const transaction = new Transaction();
                    transaction.add(submitOperation);
                    transaction
                        .broadcast(privateKey)
                        .then(() => {
                            resolve();
                        })
                        .catch(err => {
                            reject(
                                this.handleError(ContentError.transaction_broadcast_failed, err)
                            );
                        });
                })
                .catch(err => this.handleError(ContentError.database_operation_failed, err));
        });
    }

    public getOpenBuyings(): Promise<BuyingContent[]> {
        return new Promise<BuyingContent[]>(((resolve, reject) => {
            const operation = new DatabaseOperations.GetOpenBuyings();
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
        }));
    }

    public getOpenBuyingsByURI(URI: string): Promise<BuyingContent[]> {
        return new Promise<BuyingContent[]>(((resolve, reject) => {
            const operation = new DatabaseOperations.GetOpenBuyingsByURI(URI);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
        }));
    }

    public getOpenBuyingsByConsumer(accountId: string): Promise<BuyingContent[]> {
        return new Promise<BuyingContent[]>(((resolve, reject) => {
            const operation = new DatabaseOperations.GetOpenBuyingsByConsumer(accountId);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
        }));
    }

    public getBuyingsByConsumerURI(accountId: string, URI: string): Promise<BuyingContent[] | null> {
        return new Promise<BuyingContent[]>(((resolve, reject) => {
            const operation = new DatabaseOperations.GetBuyingByConsumerURI(accountId, URI);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
        }));
    }

    public getBuyingHistoryObjectsByConsumer(accountId: string): Promise<BuyingContent[]> {
        return new Promise<BuyingContent[]>((resolve, reject) => {
            const operation = new DatabaseOperations.GetBuyingsHistoryObjectsByConsumer(accountId);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(ContentError.database_operation_failed, err)));
        });
    }

    private formatPrices(content: ContentExchangeObject[], assets: DCoreAssetObject[]): ContentExchangeObject[] {
        const result: ContentExchangeObject[] = content.map(obj => {
            const asset = assets.find(a => a.id === obj.price.asset_id);
            const c = Object.assign({}, obj);
            c.price.amount = Utils.formatAmountForAsset(obj.price.amount, asset);
            return c;
        });
        return result;
    }

    private getFileSize(fileSize: number): number {
        return Math.ceil(fileSize / (1024 * 1024));
    }

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
     *
     * @param {string} contentId Id of content to be bought, example: '1.2.123'
     * @param {string} buyerId Account id of user buying content, example: '1.2.123'
     * @param {string} elGammalPub ElGammal public key which will be used to identify users bought content
     * @param {string} privateKey
     * @return {Promise<void>}
     */
    public buyContent(contentId: string,
                      buyerId: string,
                      elGammalPub: string,
                      privateKey: string): Promise<void> {
        return new Promise((resolve, reject) => {
            this.getContent(contentId)
                .then((content: Content) => {
                    const buyOperation = new Operations.BuyContentOperation(
                        content.URI,
                        buyerId,
                        content.price,
                        1,
                        {s: elGammalPub}
                    );
                    const transaction = new Transaction();
                    transaction.add(buyOperation);
                    transaction
                        .broadcast(privateKey)
                        .then(() => {
                            resolve();
                        })
                        .catch((err: any) => {
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
     * List available seeders ordered by price.
     *
     * @param {number} resultSize   Number of results per request. Default 100(max)
     * @return {Promise<Seeder[]>}
     */
    public getSeeders(resultSize: number = 100): Promise<Seeder[]> {
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
     * Return all purchased content for account id.
     *
     * @param {string} accountId example: '1.2.345'
     * @param {string} order example: '1.2.345'
     * @param {string} startObjectId example: '1.2.345'
     * @param {string} term example: '1.2.345'
     * @param {number} resultSize Number of results default = 100
     * @return {Promise<Content[]>}
     */
    public getPurchasedContent(accountId: string,
                               order: SearchParamsOrder = SearchParamsOrder.createdDesc,
                               startObjectId: string = '0.0.0',
                               term: string = '',
                               resultSize: number = 100): Promise<Content[]> {
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
     * In case to list all rating for content, leave a parameter forUser empty string.
     *
     * @param {string} contentId
     * @param {string} forUser
     * @param {string} ratingStartId
     * @param {number} count
     * @return {Promise<Array<Rating>>}
     */
    getRating(contentId: string, forUser: string, ratingStartId: string, count: number = 100): Promise<Array<Rating>> {
        return new Promise<Array<Rating>>((resolve, reject) => {
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

    searchFeedback(accountId: string, contentURI: string, ratingStartId: string, count: number = 100): Promise<Array<Rating>> {
        return new Promise<Array<Rating>>((resolve, reject) => {
            const operation = new DatabaseOperations.SearchFeedback(accountId, contentURI, ratingStartId, count);
            this.dbApi.execute(operation)
                .then(res => {
                    resolve(res);
                })
                .catch(err => {
                    reject(this.handleError(ContentError.database_operation_failed, err));
                });
        });
    }

    getAuthorCoAuthors(URI: string): Promise<[string, string[]] | null> {
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

    leaveCommentAndRating(contentURI: string, consumer: string, comment: string, rating: number, consumerPKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const operation = new Operations.LeaveRatingAndComment(contentURI, consumer, comment, rating);
            const transaction = new Transaction();
            transaction.add(operation);
            transaction.broadcast(consumerPKey)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(ContentError.transaction_broadcast_failed, err)));
        });
    }
}
