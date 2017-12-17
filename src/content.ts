import { DatabaseApi, DatabaseOperations, SearchParams, SearchParamsOrder } from './api/database';
import { ChainApi, ChainMethods } from './api/chain';
import {
    BuyContentOperation,
    ContentCancelOperation,
    OperationName,
    SubmitContentOperation,
    Transaction
} from './transaction';
import { Asset } from './account';
import {isUndefined} from 'util';

const moment = require('moment');

export class ContentError {
    static database_operation_failed = 'operation_failed';
    static fetch_content_failed = 'fetch_content_failed';
    static transaction_broadcast_failed = 'transaction_broadcast_failed';
    static restore_content_keys_failed = 'restore_content_keys_failed';
}

export interface SubmitObject {
    authorId: string;
    seeders: Seeder[];
    fileName: string;
    date: Date;
    price: number;
    size: number;
    URI: string;
    hash: string;
    keyParts: KeyParts[];
    synopsis: any;
}

export interface Content {
    /**
     * If of the content.
     */
    id: string;
    /**
     * Id of content's buy object, for download purposes.
     */
    buy_id?: string;
    author: string;
    price: Price;
    synopsis: any;
    status: Status;
    URI: string;
    _hash: string;
    AVG_rating: number;
    size: number;
    expiration: string;
    created: string;
    times_bought: number;
}

export interface Synopsis {
    title: string;
    description: string;
    content_type_id: string;
    file_name: string;
    language: string;
    sampleURL: string;
    fileFormat: string;
    length: string;
    content_licence: string;
    thumbnail: string;
    userRights: string;
}

export class KeyPair {
    private _public: string;
    private _private: string;
    get privateKey(): string {
        return this._private;
    }

    get publicKey(): string {
        return this._public;
    }

    constructor(privateKey: string, publicKey: string) {
        this._private = privateKey;
        this._public = publicKey;
    }
}

export interface Key {
    s: string;
}

export interface KeyParts {
    C1: Key;
    D1: Key;
}

export interface ContentKeys {
    key: string
    parts: KeyParts[]
}

export class ContentType {
    private _appId: number;
    private _category: number;
    private _subCategory: number;
    private _isInappropriate: boolean;

    constructor(appId: number,
        category: number,
        subCategory: number,
        isInappropriate: boolean) {
        this._appId = appId;
        this._category = category;
        this._subCategory = subCategory;
        this._isInappropriate = isInappropriate;
    }

    public getId(): string {
        return `${this._appId}.${this._category}.${this._subCategory}.${this
            ._isInappropriate}`;
    }
}

export interface Price {
    amount: number;
    asset_id: string;
}

export class Status {
    static Uploaded = 'Uploaded';
    static Partially_uploaded = 'Partially uploaded';
    static Uploading = 'Uploading';
    static Expired = 'Expired';
}

export interface Seeder {
    id: string;
    seeder: string;
    free_space: number;
    price: Asset;
    expiration: string;
    pubKey: Key;
    ipfs_ID: string;
    stats: string;
    rating: number;
    region_code: string;
}

/**
 * ContentApi provide methods to communication
 * with content stored in decent network.
 */
export class ContentApi {
    private _dbApi: DatabaseApi;
    private _chainApi: ChainApi;

    constructor(dbApi: DatabaseApi, chainApi: ChainApi) {
        this._dbApi = dbApi;
        this._chainApi = chainApi;
    }

    /**
     * Searches content submitted to decent network and is not expired.
     *
     * @param {SearchParams} searchParams
     * @return {Promise<Content[]>}
     */
    public searchContent(searchParams: SearchParams): Promise<Content[]> {
        const dbOperation = new DatabaseOperations.SearchContent(searchParams);
        return new Promise((resolve, reject) => {
            this._dbApi
                .execute(dbOperation)
                .then((content: any) => {
                    content.forEach((c: any) => {
                        c.synopsis = JSON.parse(c.synopsis);
                    });
                    resolve(content);
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
     * @return {Promise<Content>}
     */
    public getContent(id: string): Promise<Content> {
        return new Promise((resolve, reject) => {
            const dbOperation = new DatabaseOperations.GetObjects([id]);
            this._dbApi
                .execute(dbOperation)
                .then(contents => {
                    const [content] = contents;
                    const stringidied = JSON.stringify(content);
                    const objectified = JSON.parse(stringidied);
                    objectified.synopsis = JSON.parse(objectified.synopsis);
                    if (isUndefined(objectified.price['amount'])) {
                        objectified.price = objectified.price['map_price'][0][1];
                    }
                    resolve(objectified as Content);
                })
                .catch(err => {
                    reject(err);
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

                    const cancellation: ContentCancelOperation = {
                        author: authorId,
                        URI: URI
                    };
                    const transaction = new Transaction();
                    transaction.addOperation({
                        name: OperationName.content_cancellation,
                        operation: cancellation
                    });
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
                this._dbApi.execute(dbOperation)
                .then(res => {
                    console.log(res);
                    const validKey = elGamalKeys.find((elgPair: KeyPair) => elgPair.publicKey === res.pubKey.s);
                    if (!validKey) {
                        reject(this.handleError(ContentError.restore_content_keys_failed, 'wrong keys'));
                    }

                    const dbOperation = new DatabaseOperations.RestoreEncryptionKey(contentId, validKey.privateKey);
                    this._dbApi
                        .execute(dbOperation)
                        .then(key => {
                            resolve(key);
                        })
                        .catch(err => {
                            reject(this.handleError(ContentError.restore_content_keys_failed, err));
                        });
                });
            });
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
            this._dbApi
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
            const submitOperation: SubmitContentOperation = {
                size: content.size,
                author: content.authorId,
                co_authors: [],
                URI: content.URI,
                quorum: content.seeders.length,
                price: [
                    {
                        region: 1,
                        price: {
                            amount: content.price,
                            asset_id: ChainApi.asset_id
                        }
                    }
                ],
                hash: content.hash,
                seeders: content.seeders.map(s => s.seeder),
                key_parts: content.keyParts,
                expiration: content.date.toString(),
                publishing_fee: {
                    amount: this.calculateFee(content),
                    asset_id: ChainApi.asset_id
                },
                synopsis: JSON.stringify(content.synopsis)
            };
            const transaction = new Transaction();
            transaction.addOperation({
                name: OperationName.content_submit,
                operation: submitOperation
            });
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
        });
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
                    const buyOperation: BuyContentOperation = {
                        URI: content.URI,
                        consumer: buyerId,
                        price: content.price,
                        region_code_from: 1,
                        pubKey: { s: elGammalPub }
                    };
                    const transaction = new Transaction();
                    transaction.addOperation({
                        name: OperationName.requestToBuy,
                        operation: buyOperation
                    });
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
            this._dbApi
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
        order: string = SearchParamsOrder.createdDesc,
        startObjectId: string = '0.0.0',
        term: string = '',
        resultSize: number = 100): Promise<Content[]> {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject('missing_parameter');
                return;
            }
            const searchParams = new SearchParams();
            searchParams.count = resultSize;
            this.searchContent(searchParams)
                .then(allContent => {
                    const dbOperation = new DatabaseOperations.GetBoughtObjectsByCustomer(
                        accountId,
                        order,
                        startObjectId,
                        term,
                        resultSize
                    );
                    this._dbApi
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

    private handleError(message: string, err: any): Error {
        const error = new Error(message);
        error.stack = err;
        return error;
    }
}
