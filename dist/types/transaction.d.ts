/// <reference types="node" />
export interface Operation {
    name: string;
    operation: OperationType;
}
export declare class OperationName {
    static transfer: string;
    static content_cancellation: string;
    static requestToBuy: string;
    static content_submit: string;
}
export declare class Asset {
    amount: number;
    asset_id: string;
}
export interface Memo {
    from: string;
    to: string;
    nonce: string;
    message: Buffer;
}
export interface OperationType {
}
export interface TransferOperation extends OperationType {
    from: string;
    to: string;
    amount: Asset;
    memo: Memo;
}
export interface ContentCancelOperation extends OperationType {
    author: string;
    URI: string;
}
export interface BuyContentOperation extends OperationType {
    URI: string;
    consumer: string;
    price: Asset;
    region_code_from: number;
    pubKey: Key;
}
export interface SubmitContentOperation extends OperationType {
    size: number;
    author: string;
    co_authors: any[];
    URI: string;
    quorum: number;
    price: RegionalPrice[];
    hash: string;
    seeders: string[];
    key_parts: KeyParts[];
    expiration: string;
    publishing_fee: Asset;
    synopsis: string;
}
export interface Key {
    s: string;
}
export interface KeyParts {
    C1: Key;
    D1: Key;
}
export interface RegionalPrice {
    region: number;
    price: Asset;
}
export declare class Transaction {
    private _transaction;
    private _operations;
    constructor();
    readonly operations: Operation[];
    addOperation(operation: Operation): boolean;
    broadcast(privateKey: string): Promise<void>;
    private setTransactionFees();
    private signTransaction(privateKey, publicKey);
}
