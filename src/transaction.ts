import {dcorejs_lib} from './helpers';
import {KeyPrivate, KeyPublic, Utils} from './utils';
import {Operation} from './model/transaction';

/**
 * Class contains available transaction operation names constants
 */
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

    get transaction(): any {
        return this._transaction;
    }

    /**
     * Append new operation to transaction object.
     *
     * @param {Operation} operation
     * @return {boolean}
     */
    public add(operation: Operation): boolean {
        this._transaction.add_type_operation(operation.name, operation.operation);
        this._operations.push(operation);
        return true;
    }

    public propose(proposalParameters: any): void {
        this._transaction.propose(proposalParameters);
    }

    /**
     * Broadcast transaction to dcore_js blockchain.
     *
     * @param {string} privateKey
     * @return {Promise<void>}
     */
    public broadcast(privateKey: string, sign: boolean = true): Promise<void> {
        const secret = Utils.privateKeyFromWif(privateKey);
        const pubKey = Utils.getPublicKey(secret);
        return new Promise((resolve, reject) => {
            this.setTransactionFees()
                .then(() => {
                    if (sign) {
                        this.signTransaction(secret, pubKey);
                    }
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
