import { dcorejs_lib } from './helpers';
import { KeyPrivate, KeyPublic, Utils } from './utils';

import {Key, KeyParts} from './content';
import { Authority, Options } from './account';
/**
 * OperationType to be broadcasted to blockchain
 * internal representation
 */
export interface Operation {
    name: string;
    operation: OperationType;
}

/**
 * Class contains available transaction operation names constants
 */
export class OperationName {
    static transfer = 'transfer';
    static content_cancellation = 'content_cancellation';
    static requestToBuy = 'request_to_buy';
    static content_submit = 'content_submit';
    static account_update = 'account_update';
}

/**
 * Asset represent amount of specific
 * asset.
 */
export class Asset {
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
 * OperationType operations generalization
 */
export interface OperationType {}

/**
 * Transfer operation between two accounts
 * represented by from/to string ids
 *
 * !Important: asset need to be calculated to specific asset
 */
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

export interface AccountUpdateOperation extends OperationType {
    account: string;
    owner: Authority;
    active: Authority;
    new_options: Options;
    extensions: {};
}

export interface RegionalPrice {
    region: number;
    price: Asset;
}

export class Transaction {
    /**
     * dcore_jsjs.lib/lib - TransactionBuilder
     */
    private _transaction: any;
    private _operations: Operation[] = [];

    constructor() {
        this._transaction = new dcorejs_lib.TransactionBuilder();
    }

    /**
     * List of operations added to transaction
     * @return {Operation[]}
     */
    get operations(): Operation[] {
        return this._operations;
    }

    /**
     * Append new operation to transaction object.
     *
     * @param {Operation} operation
     * @return {boolean}
     */
    public addOperation(operation: Operation): boolean {
        if (!dcorejs_lib.ops.hasOwnProperty(operation.name)) {
            return false;
        }
        dcorejs_lib.ops[operation.name].keys.forEach((key: string) => {
            return operation.operation.hasOwnProperty(key);
        });
        this._transaction.add_type_operation(operation.name, operation.operation);
        this._operations.push(operation);
        return true;
    }

    /**
     * Broadcast transaction to dcore_js blockchain.
     *
     * @param {string} privateKey
     * @return {Promise<void>}
     */
    public broadcast(privateKey: string): Promise<void> {
        const secret = Utils.privateKeyFromWif(privateKey);
        const pubKey = Utils.getPublicKey(secret);
        return new Promise((resolve, reject) => {
            this.setTransactionFees()
                .then(() => {
                    this.signTransaction(secret, pubKey);
                    this._transaction.broadcast()
                        .then(() => {
                            resolve();
                        })
                        .catch((err: any) => {
                            reject(err);
                        });
                })
                .catch((err: any) => {
                    reject(err);
                });
        });
    }

    /**
     * Set transaction fee required for transaction operation
     * @param transaction TransactionBuilder instance
     * @return {Promise<void>}
     */
    private setTransactionFees(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._transaction.set_required_fees()
                .then(() => {
                    resolve();
                })
                .catch(() => {
                    // TODO: error handling
                    reject();
                });
        });
    }

    /**
     * Sign transaction with given private/public key pair.
     *
     * @param {KeyPrivate} privateKey
     * @param {KeyPublic} publicKey
     */
    private signTransaction(privateKey: KeyPrivate, publicKey: KeyPublic): void {
        this._transaction.add_signer(privateKey.key, publicKey.key);
    }
}
