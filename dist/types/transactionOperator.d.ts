/// <reference types="node" />
/**
 * Operation to be broadcasted to blockchain
 * internal representation
 */
export interface TransactionOperation {
    name: string;
    operation: Transaction;
}
/**
 * Class contains available transaction operation names constants
 */
export declare class TransactionOperationName {
    static transfer: string;
    static content_cancellation: string;
    static requestToBuy: string;
    static content_submit: string;
}
/**
 * Asset represent amount of specific
 * asset.
 */
export interface Asset {
    amount: number;
    asset_id: string;
}
/**
 * Memo message object representation
 */
export interface Memo {
    from: string;
    to: string;
    nonce: string;
    message: Buffer;
}
/**
 * Transaction operations generalization
 */
export interface Transaction {
}
/**
 * Transfer operation between two accounts
 * represented by from/to string ids
 *
 * !Important: asset need to be calculated to specific asset
 */
export interface TransferOperation extends Transaction {
    from: string;
    to: string;
    amount: Asset;
    memo: Memo;
}
export interface ContentCancelOperation extends Transaction {
    author: string;
    URI: string;
}
export interface BuyContentOperation extends Transaction {
    URI: string;
    consumer: string;
    price: Asset;
    region_code_from: number;
    pubKey: Key;
}
export interface SubmitContentOperation extends Transaction {
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
/**
 * // TODO: Create wrapper class for TransactionBuilder for stronger typing
 * Provides methods to manipulate and broadcast transactions to
 * network.
 */
export declare class TransactionOperator {
    static DCTPower: number;
    static createTransaction(): any;
    static createAsset(amount: number, assetId: string): Asset;
    /**
       * Add requested operation to transaction object.
       *
       * If operation does not exist or data property of
       * operation object does not match required properties
       * false is returned.
       *
       * @param {TransactionOperation} operation
       * @param transaction TransactionBuilder instance
       * @return {boolean}
       */
    static addOperation(operation: TransactionOperation, transaction: any): boolean;
    /**
       * broadcastTransaction will set required fees for operation,
       * sign operation with public/private keys and broadcast is
       * to blockchain
       *
       * @param transaction TransactionBuilder instance with requested operations
       * @param {string} privateKey
       * @param {string} publicKey
       * @return {Promise<any>}
       */
    static broadcastTransaction(transaction: any, privateKey: string, publicKey: string): Promise<any>;
    /**
       * Set transaction fee required for transaction operation
       * @param transaction TransactionBuilder instance
       * @return {Promise<any>}
       */
    private static setTransactionFees(transaction);
}
