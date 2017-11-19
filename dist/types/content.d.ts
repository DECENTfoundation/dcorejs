/// <reference types="node" />
import { DatabaseApi, SearchParams } from './api/database';
import { ChainApi } from './api/chain';
import { Key, KeyParts } from './transaction';
import { Asset } from './account';
export declare class ContentError {
    static database_operation_failed: string;
    static fetch_content_failed: string;
    static transaction_broadcast_failed: string;
    static restore_content_keys_failed: string;
}
export interface SubmitObject {
    authorId: string;
    seeders: Array<any>;
    fileName: string;
    fileContent: Buffer;
    date: string;
    fileSize: number;
    price: number;
    size: number;
    URI: string;
    hash: string;
    keyParts: KeyParts[];
    synopsis: Synopsis;
}
export interface Content {
    id: string;
    buy_id?: string;
    author: string;
    price: Price;
    synopsis: Synopsis;
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
export declare class KeyPair {
    private _public;
    private _private;
    readonly privateKey: string;
    readonly publicKey: string;
    constructor(privateKey: string, publicKey: string);
}
export declare class ContentType {
    private _appId;
    private _category;
    private _subCategory;
    private _isInappropriate;
    constructor(appId: number, category: number, subCategory: number, isInappropriate: boolean);
    getId(): string;
}
export interface Price {
    amount: number;
    asset_id: string;
}
export declare class Status {
    static Uploaded: string;
    static Partially_uploaded: string;
    static Uploading: string;
    static Expired: string;
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
export declare class ContentApi {
    private _dbApi;
    private _chainApi;
    constructor(dbApi: DatabaseApi, chainApi: ChainApi);
    searchContent(searchParams: SearchParams): Promise<Content[]>;
    getContent(id: string): Promise<Content>;
    removeContent(contentId: string, authorId: string, privateKey: string): Promise<any>;
    restoreContentKeys(contentId: string, accountId: string, ...elGamalPrivate: KeyPair[]): Promise<string>;
    generateContentKeys(seeders: string[]): Promise<any>;
    addContent(content: SubmitObject, privateKey: string): Promise<any>;
    private getFileSize(fileSize);
    private calculateFee(content);
    buyContent(contentId: string, buyerId: string, elGammalPub: string, privateKey: string): Promise<any>;
    getSeeders(resultSize?: number): Promise<Seeder[]>;
    getPurchasedContent(accountId: string, order?: string, startObjectId?: string, term?: string, resultSize?: number): Promise<Content[]>;
    private handleError(message, err);
}
