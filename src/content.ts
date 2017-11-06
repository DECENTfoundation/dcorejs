import {DatabaseApi, DatabaseOperation} from './api/database';
import {ChainApi, ChainMethods} from './api/chain';
import {
    BuyContentOperation,
    ContentCancelOperation,
    Key,
    KeyParts,
    OperationName,
    SubmitContentOperation,
    Transaction
} from './transaction';
import {Asset} from './account';

const moment = require('moment');

export interface SubmitObject {
    authorId: string
    seeders: Array<any>
    fileName: string
    fileContent: Buffer
    date: string
    fileSize: number
    price: number
    size: number
    URI: string
    hash: string
    keyParts: KeyParts[]
    synopsis: Synopsis
}

export interface Content {
    id: string
    author: string
    price: Price
    synopsis: Synopsis
    status: Status
    URI: string
    _hash: string
    AVG_rating: number
    size: number
    expiration: string
    created: string
    times_bought: number
}

export interface Synopsis {
    title: string
    description: string
    content_type_id: string
    file_name: string
    language: string
    sampleURL: string
    fileFormat: string
    length: string
    content_licence: string
    thumbnail: string
    userRights: string
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
    amount: number
    asset_id: string
}

export class Status {
    static Uploaded = 'Uploaded';
    static Partially_uploaded = 'Partially uploaded';
    static Uploading = 'Uploading';
    static Expired = 'Expired';
}

export class SearchParamsOrder {
    static authorAsc = '+author';
    static ratingAsc = '+rating';
    static sizeAsc = '+size';
    static priceAsc = '+price';
    static createdAsc = '+created';
    static expirationAsc = '+expiration';
    static authorDesc = '-author';
    static ratingDesc = '-rating';
    static sizeDesc = '-size';
    static priceDesc = '-price';
    static createdDesc = '-created';
    static expirationDesc = '-expiration';
}

/**
 * Parameters for content search.
 * Order parameter options can be found in SearchParamsOrder class
 * Region code is ISO 3166-1 alpha-2 two-letter region code.
 */
export class SearchParams {
    term = '';
    order = '';
    user = '';
    region_code = '';
    itemId = '';
    category = '';
    count: number;

    constructor(term = '',
                order = '',
                user = '',
                region_code = '',
                itemId = '',
                category: string = '',
                count: number = 6) {
        this.term = term || '';
        this.order = order || '';
        this.user = user || '';
        this.region_code = region_code || '';
        this.itemId = itemId || '0.0.0';
        this.category = category || '1';
        this.count = count || 6;
    }

    get params(): any[] {
        let params: any[] = [];
        params = Object.values(this).reduce((previousValue, currentValue) => {
            previousValue.push(currentValue);
            return previousValue;
        }, params);
        return params;
    }
}

export interface Seeder {
    id: string
    seeder: string
    free_space: number
    price: Asset
    expiration: string
    pubKey: Key
    ipfs_ID: string
    stats: string
    rating: number
    region_code: string
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

    public searchContent(searchParams: SearchParams): Promise<Content[]> {
        return new Promise((resolve, reject) => {
            this._dbApi
                .execute(DatabaseOperation.searchContent, searchParams.params)
                .then((content: any) => {
                    resolve(content);
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    }

    public getContent(id: string): Promise<Content> {
        return new Promise((resolve, reject) => {
            const chainOps = new ChainMethods();
            chainOps.add(ChainMethods.getObject, id);
            this._chainApi
                .fetch(chainOps)
                .then((response: any[]) => {
                    const [content] = response;
                    const stringidied = JSON.stringify(content);
                    const objectified = JSON.parse(stringidied);
                    objectified.price = objectified.price.map_price[0][1];
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
     * @param {string} URI example: 'ipfs:abc78b7a9b7a98b7c98cb798c7b9a8bc9a87bc98a9bc'
     * @param {string} authorId example: '1.2.532'
     * @param {string} privateKey
     * @return {Promise<any>}
     */
    public removeContent(URI: string,
                         authorId: string,
                         privateKey: string): Promise<any> {
        return new Promise((resolve, reject) => {
            const methods = new ChainMethods();
            methods.add(ChainMethods.getAccount, authorId);

            this._chainApi.fetch(methods).then(result => {
                const [account] = result;
                const publicKey = account
                    .get('owner')
                    .get('key_auths')
                    .get(0)
                    .get(0);
                const cancellation: ContentCancelOperation = {
                    author: authorId,
                    URI: URI
                };
                const transaction = new Transaction();
                transaction.addOperation({name: OperationName.content_cancellation, operation: cancellation});
                transaction.broadcast(privateKey)
                    .then(() => {
                        resolve();
                    })
                    .catch(() => {
                        reject();
                    });
            });
        });
    }

    /**
     * Restores key to decrypt downloaded content.
     *
     * ElGammalPrivate key is used to identify if user have bought content.
     *
     * @param {String} contentId example: '1.2.453'
     * @param {string} elGammalPrivate
     * @return {Promise<string>} Key to decrypt content
     */
    public restoreContentKeys(contentId: String,
                              elGammalPrivate: string): Promise<string> {
        return new Promise((resolve, reject) => {
            this._dbApi
                .execute(DatabaseOperation.restoreEncryptionKey, [
                    {s: elGammalPrivate},
                    contentId
                ])
                .then(key => {
                    resolve(key);
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    /**
     * Obtains content key with key parts of each seeder to encrypt
     * content to be uploaded.
     *
     * @param {string[]} seeders Array of seeders ids example: ['1.2.12', '1.4.13']
     * @return {Promise<any>}
     */
    public generateContentKeys(seeders: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this._dbApi
                .execute(DatabaseOperation.generateContentKeys, [seeders])
                .then(keys => {
                    resolve(keys);
                })
                .catch(err => {
                    reject(err);
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
     * @param {string} publicKey
     * @return {Promise<any>}
     */
    public addContent(content: SubmitObject,
                      privateKey: string): Promise<any> {
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
                expiration: content.date,
                publishing_fee: {
                    amount: this.calculateFee(content),
                    asset_id: ChainApi.asset_id
                },
                synopsis: JSON.stringify(content.synopsis)
            };
            const transaction = new Transaction();
            transaction.addOperation({name: OperationName.content_submit, operation: submitOperation});
            transaction.broadcast(privateKey)
                .then(() => {
                    resolve();
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    private getFileSize(fileSize: number): number {
        return Math.ceil(fileSize / (1024 * 1024));
    }

    private calculateFee(content: SubmitObject): number {
        const num_days = moment(content.date).diff(moment(), 'days') + 1;
        return Math.ceil(
            this.getFileSize(content.fileSize) *
            content.seeders.reduce(
                (fee, seed) => fee + seed.price.amount * num_days,
                0
            )
        );
    }

    /**
     * Request buy content.
     *
     * @param {string} contentId Id of content to be bought, example: '1.2.123'
     * @param {string} buyerId Account id of user buying content, example: '1.2.123'
     * @param {string} elGammalPub ElGammal public key which will be used to identify users bought content
     * @param {string} privateKey
     * @return {Promise<any>}
     */
    public buyContent(contentId: string,
                      buyerId: string,
                      elGammalPub: string,
                      privateKey: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getContent(contentId)
                .then((content: Content) => {
                    // const transaction = TransactionOperator.createTransaction();
                    console.log(content);
                    const buyOperation: BuyContentOperation = {
                        URI: content.URI,
                        consumer: buyerId,
                        price: content.price,
                        region_code_from: 1,
                        pubKey: {s: elGammalPub}
                    };
                    const transaction = new Transaction();
                    transaction.addOperation({name: OperationName.requestToBuy, operation: buyOperation});
                    transaction.broadcast(privateKey)
                        .then(() => {
                            resolve();
                        })
                        .catch((err: any) => {
                            console.log(err);
                            reject();
                        });
                })
                .catch(err => {
                    console.log(err);
                    reject(err);
                });
        });
    }

    /**
     * List available seeders ordered by price.
     *
     * @param {number} resultSize Number of results per request
     * @return {Promise<Seeder[]>}
     */
    public getSeeders(resultSize: number): Promise<Seeder[]> {
        return new Promise((resolve, reject) => {
            this._dbApi.execute(DatabaseOperation.listPublishers, [resultSize])
                .then(result => {
                    resolve(result as Seeder[]);
                })
                .catch(err => {
                    console.log(err);
                    reject();
                });
        });
    }

    public getPurchasedContent(accountId: string, resultSize: number = 100): Promise<any[]> {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject('missing_parameter');
                return;
            }
            const searchParams = new SearchParams();
            searchParams.count = resultSize;
            this.searchContent(searchParams)
                .then(allContent => {
                    this._dbApi.execute(DatabaseOperation.getBuyingObjectsByConsumer, [accountId, '', '0.0.0', '', resultSize])
                        .then(boughtContent => {
                            boughtContent.forEach((bought: any) => {
                                allContent.forEach(content => {
                                    if (bought.URI === content.URI) {
                                        bought.contentObject = content;
                                    }
                                });
                            });
                            const bc = boughtContent.filter((bought: any) => bought.contentObject !== undefined);
                            resolve(bc);
                        })
                        .catch(err => {
                            reject();
                        });
                });
        });
    }
}
