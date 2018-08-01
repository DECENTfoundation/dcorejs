/**
 * @module TransactionBuilder
 */
import {dcorejs_lib} from './helpers';
import {KeyPrivate, Utils} from './utils';
import {Operation} from './model/transaction';
import {ProposalCreateParameters} from './model/proposal';
import {Validator} from './modules/validator';
import {Type} from './model/types';

export enum TransactionBuilderError {
    invalid_parameters = 'invalid_parameters',
    failed_to_sign_transaction = 'failed_to_sign_transaction',
}

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

    /**
     * Get dcorejs-lib format transaction.
     *
     * @returns {any}   dcorejs-lib transaction object.
     */
    get transaction(): any {
        return this._transaction;
    }

    /**
     * Append new operation to transaction object.
     *
     * @param {Operation} operation     Operation to append to transaction.
     * @return {boolean}                Successful operation add value.
     */
    public addOperation(operation: Operation): void {
        if (operation === undefined || operation.name === undefined || operation.operation === undefined
        || typeof operation.name !== 'string') {
            throw new TypeError(TransactionBuilderError.invalid_parameters);
        }
        try {
            this._transaction.add_type_operation(operation.name, operation.operation);
            this._operations.push(operation);
        } catch (exception) {
            throw new Error(exception);
        }
    }

    /**
     * Transform transaction into proposal type transaction.
     *
     * @param {IProposalCreateParameters} proposalParameters     Proposal transaction parameters.
     */
    public propose(proposalParameters: ProposalCreateParameters): void {
        if (!Validator.validateObject<ProposalCreateParameters>(proposalParameters, ProposalCreateParameters)) {
            throw new TypeError(TransactionBuilderError.invalid_parameters);
        }
        this._transaction.propose(proposalParameters);
    }

    /**
     * Broadcast transaction to DCore blockchain.
     *
     * @param {string} privateKey       Private key to sign transaction in WIF(hex)(Wallet Import Format) format .
     * @param sign                      If value is 'true' transaction will be singed, in 'false' transaction will not be signed.
     *                                  Default 'true'
     * @return {Promise<void>}          Void.
     */
    public broadcast(privateKey: string, sign: boolean = true): Promise<void> {
        if (!Validator.validateArguments([privateKey, sign], [Type.string, Type.boolean])) {
            throw new TypeError(TransactionBuilderError.invalid_parameters);
        }
        const secret = Utils.privateKeyFromWif(privateKey);
        return new Promise((resolve, reject) => {
            this.setTransactionFees()
                .then(() => {
                    if (sign) {
                        this.signTransaction(secret);
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
     *
     * @return {Promise<void>}  Void.
     */
    private setTransactionFees(): Promise<void> {
        return new Promise((resolve, reject) => {
            this._transaction.set_required_fees()
                .then(() => {
                    resolve();
                })
                .catch(() => {
                    reject();
                });
        });
    }

    /**
     * Sign transaction with given private/public key pair.
     *
     * @param {KeyPrivate} privateKey   Private key to sign transaction.
     */
    public signTransaction(privateKey: KeyPrivate): void {
        if (privateKey === undefined || privateKey.stringKey === undefined || typeof privateKey.stringKey !== 'string'
        || privateKey.key === undefined) {
            throw new TypeError(TransactionBuilderError.invalid_parameters);
        }
        try {
            const publicKey = KeyPrivate.fromWif(privateKey.stringKey).getPublicKey().key;
            this._transaction.add_signer(privateKey.key, publicKey);
        } catch (exception) {
            throw new Error(TransactionBuilderError.failed_to_sign_transaction);
        }
    }

    /**
     * Replace operation on operationIndex with newOperation
     *
     * @param {number} operationIndex               Index of operation to replace. Must be greater than 0 and smaller than
     *                                              length of operations.
     * @param {Operation} newOperation              Operation to be placed to index.
     * @returns {boolean}                           Returns true if replaced, false otherwise.
     */
    public replaceOperation(operationIndex: number, newOperation: Operation): boolean {
        if (!Validator.validateArguments([operationIndex], [Type.number]) || !Validator.validateObject(newOperation, Operation)) {
            throw new TypeError(TransactionBuilderError.invalid_parameters);
        }
        if (operationIndex >= 0 && operationIndex < this._operations.length) {
            try {
                this._transaction.add_type_operation(newOperation.name, newOperation.operation);
                this._operations[operationIndex] = newOperation;
                return true;
            } catch (exception) {
                if (process.env.ENVIRONMENT === 'DEV') {
                    console.log(exception);
                }
                return false;
            }
        }
        return false;
    }

    /**
     * Displays current transaction
     * @returns {any}   dcorejs-lib format transaction object.
     */
    public previewTransaction(): any {
        return this._transaction;
    }
}
