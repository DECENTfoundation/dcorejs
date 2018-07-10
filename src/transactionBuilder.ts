import {dcorejs_lib} from './helpers';
import {KeyPrivate, KeyPublic, Utils} from './utils';
import {Operation} from './model/transaction';
import {ProposalCreateParameters} from './model/proposal';

/**
 * Class contains available transaction operation names constants
 */
export class TransactionBuilder {
    /**
     * dcore_js.lib/lib - TransactionBuilder
     */
    private _transaction;
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
    public addOperation(operation: Operation): boolean {
        this._transaction.add_type_operation(operation.name, operation.operation);
        this._operations.push(operation);
        return true;
    }

    public propose(proposalParameters: ProposalCreateParameters): void {
        this._transaction.propose(proposalParameters);
    }

    /**
     * Broadcast transaction to dcore_js blockchain.
     *
     * @param {string} privateKey
     * @param sign
     * @return {Promise<void>}
     */
    public broadcast(privateKey: string, sign: boolean = true): Promise<void> {
        const secret = Utils.privateKeyFromWif(privateKey);
        const publicKey = Utils.getPublicKey(secret);
        return new Promise((resolve, reject) => {
            this.setTransactionFees()
                .then(() => {
                    if (sign) {
                        this.signTransaction(secret, publicKey);
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
    public signTransaction(privateKey: KeyPrivate, publicKey: KeyPublic): void {
        this._transaction.add_signer(privateKey.key, publicKey.key);
    }

    /**
     * Replace operation on operationIndex with newOperation
     *
     * @param {number} operationIndex               Must be greater than 0 and smaller than length of operations.
     * @param {Operation} newOperation
     * @returns {boolean}                           Returns true if replaced, false otherwise.
     */
    public replaceOperation(operationIndex: number, newOperation: Operation): boolean {
        if (operationIndex >= 0 && operationIndex < this._operations.length) {
            this._transaction.add_type_operation(newOperation.name, newOperation.operation);
            this._operations[operationIndex] = newOperation;
            return true;
        }
        return false;
    }

    /**
     * Displays current transaction
     */
    public previewTransaction(): any {
        return this._transaction;
    }
}
