import {DatabaseApi, DatabaseOperation} from './api/database';
import {ChainApi, ChainMethods} from './api/chain';
import {Asset, BuyContentOperation, ContentCancelOperation, TransactionOperationName, TransactionOperator} from './transactionOperator';

export class ContentObject {
    authorId: string;
    seeders: Array<any>;
    fileName: string;
    fileContent: Buffer;
    date: string;
    fileSize: number;
    price: number;

    title: string;
    description: string;
    contentTypeID: string;

    sampleURL: string;
    language: string;
    userRights: string;
    fileFormat: string;
    length: string;
    inappropriate: string;
    thumbnail: string;
    contentLicence: string;
    contentSubLincence: string;
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
                category: string,
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
            console.log(searchParams.params);
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
            this._chainApi.fetch(chainOps)
                .then((response: any[]) => {
                    const [content] = response;
                    const stringidied = JSON.stringify(content);
                    const objectified = JSON.parse(stringidied);
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
                const transaction = TransactionOperator.createTransaction();
                const cancellation: ContentCancelOperation = {
                    author: authorId,
                    URI: URI
                };
                TransactionOperator.addOperation(
                    {
                        name: TransactionOperationName.content_cancellation,
                        operation: cancellation
                    },
                    transaction
                );
                TransactionOperator.broadcastTransaction(
                    transaction,
                    privateKey,
                    publicKey
                )
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
                    console.log(keys);
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
     * @param {ContentObject} content
     * @param {string} ripemdHash Control checksum of encrypted content to be submitted
     * @param key Seeders generated keys to encrypt content. Key is recovered from seeders when downloading to decrypt content.
     * @return {Promise<any>}
     */
    public addContent(content: ContentObject,
                      ripemdHash: string,
                      key: any): Promise<any> {
        return new Promise((resolve, reject) => {
        });
    }

    /**
     * Request buy content.
     *
     * @param {string} contentId Id of content to be bought, example: '1.2.123'
     * @param {string} buyerId Account id of user buying content, example: '1.2.123'
     * @param {string} elGammalPub ElGammal public key which will be used to identify users bought content
     * @param {string} privateKey
     * @param {string} pubKey
     * @return {Promise<any>}
     */
    public buyContent(contentId: string, buyerId: string, elGammalPub: string, privateKey: string, pubKey: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getContent(contentId)
                .then((content: Content) => {
                    console.log(content);
                    const transaction = TransactionOperator.createTransaction();
                    const buyOperation: BuyContentOperation = {
                        URI: content.URI,
                        consumer: buyerId,
                        price: content.price,
                        region_code_from: 1,
                        pubKey: {s: elGammalPub}
                    };
                    TransactionOperator.addOperation({
                        name: TransactionOperationName.requestToBuy,
                        operation: buyOperation
                    }, transaction);
                    TransactionOperator.broadcastTransaction(transaction, privateKey, pubKey)
                        .then(() => {
                            resolve();
                        })
                        .catch(err => {
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
}
