/**
 * @module Model/Content
 */
import {Asset} from './account';

export interface BuyingContent extends IContentExchangeObject {
    consumer: string;
    URI: string;
    size: number;
    rating: number;
    comment: string;
    price: Asset;
    paid_price_before_exchange: Asset;
    paid_price_after_exchange: Asset;
    synopsis: string;
    seeders_answered: string[];
    key_particles: string[];
    pubKey: string;
    expiration_time: number;
    expired: boolean;
    delivered: boolean;
    expiration_or_delivery_time: number;
    rated_or_commented: number;
    created: number;
    region_code_from: number;
}

export interface Content extends IContentExchangeObject {
    /**
     * Id of the content.
     */
    id: string;
    /**
     * Id of content's buy object, for download purposes.
     */
    buy_id?: string;
    author: string;
    price: Price;
    synopsis: string;
    _hash: string;
    status: string;
    URI: string;
    AVG_rating: number;
    size: number;
    expiration: string;
    created: string;
    times_bought: number;
}

export interface DCoreSynopsis {
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

export interface Rating {
    consumer: string;
    uri: string;
    rating: number;
    comment: string;
    buying: string;
}

export enum Status {
    Uploaded = 'Uploaded',
    Partially_uploaded = 'Partially uploaded',
    Uploading = 'Uploading',
    Expired = 'Expired'
}

export interface Seeder extends IContentExchangeObject {
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

export interface ISubmitObject {
    authorId: string;
    coAuthors: [string, number][];
    seeders: Seeder[];
    fileName: string;
    date: string;
    price: number;
    size: number;
    URI: string;
    hash: string;
    keyParts: KeyParts[];
    synopsis: Synopsis;
    assetId?: string;
    publishingFeeAsset?: string;
}

export class SubmitObject implements ISubmitObject {
    authorId = '';
    coAuthors: [string, number][] = [];
    seeders: Seeder[] = [];
    fileName = '';
    date = '';
    price = 0;
    size = 0;
    URI = '';
    hash = '';
    keyParts: KeyParts[] = [];
    synopsis: Synopsis = {title: '', description: '', content_type_id: ''};
    assetId? = null;
    publishingFeeAsset? = null;
}

export interface SynopsisBase {
    title: string;
    description: string;
    content_type_id: string;
}

export interface Synopsis extends SynopsisBase {
    [key: string]: any;
}

export interface IContentExchangeObject {
    price: Price | Asset;
    paid_price_before_exchange?: Asset;
    paid_price_after_exchange?: Asset;
}

export class ContentExchangeObject implements IContentExchangeObject {
    price: Price | Asset;
    paid_price_before_exchange?: Asset = null;
    paid_price_after_exchange?: Asset = null;
}

export interface Price {
    map_price: [any, Asset][];
}
