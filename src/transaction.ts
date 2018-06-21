import {dcorejs_lib} from './helpers';
import {KeyPrivate, KeyPublic, Utils} from './utils';
import {Operation, OperationName} from './model/transaction';
import {ProposalCreateParameters} from './model/proposal';

/**
 * Class contains available transaction operation names constants
 */
export class Transaction {
    /**
     * dcore_js.lib/lib - TransactionBuilder
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

    /**
     * Returns dummy object with concrete operation
     *
     * @param {string} operationName            Name of concrete operation
     * @returns {object}
     */

    public getPrototypeOperation(operationName: string): object {
        let operation = {};
        switch (operationName) {
            case OperationName.transfer: {
                operation = {
                    from: '1.2.0',
                    to: '1.2.0',
                    price: {
                        amount: 10,
                        asset_id: '1.3.0',
                    },
                    memo: {
                        from: '',
                        to: '',
                        nonce: 0,
                        message: []
                    }
                };
                break;
            }
            case OperationName.content_cancellation: {
                operation = {
                    author: '1.2.0',
                    URI: '',
                };
                break;
            }
            case OperationName.content_submit: {
                operation = {
                    size: 1024,
                    author: '1.2.0',
                    co_authors: ['1.2.0', '1.2.1'],
                    URI: '',
                    quorum: 0,
                    price: {
                        region: 0,
                        price: {
                            amount: 10,
                            asset_id: '1.3.0'
                        }
                    }
                    ,
                    hash: '',
                    seeders: ['1.2.0', '1.2.3'],
                    key_parts: [
                        {C1: {s: ''}, D1: {s: ''}},
                    ],
                    expiration: '2018-07-04T16:00:00',
                    publishing_fee: {
                        amount: 0,
                        asset_id: '1.3.0',
                    },
                    synopsis: ''
                };
                break;
            }
            case OperationName.account_update: {
                operation = {
                    account: '1.2.0',
                    owner: {
                        weight_threshold: 0,
                        account_auths: [],
                        key_auths: [['', 0], ['', 1]],
                    },
                    active: {
                        weight_threshold: 0,
                        account_auths: [],
                        key_auths: [['', 0], ['', 1]],
                    },
                    new_options: {
                        memo_key: '',
                        voting_account: '',
                        num_miner: 0,
                        votes: ['', ''],
                        extensions: [],
                        allow_subscription: true,
                        price_per_subscribe: {
                            amount: 10,
                            asset_id: '1.3.0',
                        },
                        subscription_period: 0,
                    },
                    extensions: [],

                };
                break;
            }
            case OperationName.asset_create: {
                operation = {
                    issuer: '',
                    symbol: '',
                    precision: 0,
                    description: '',
                    options: {
                        max_supply: 0,
                        core_exchange_rate: {
                            base: {
                                amount: 10,
                                asset_id: '1.3.0',
                            },
                            quote: {
                                amount: 10,
                                asset_id: '1.3.0',
                            },
                        },
                        is_exchangeable: false,
                        extensions: [],
                    },
                    is_exchangeable: false,
                    extensions: [],
                    monitored_asset_opts: {
                        feeds: [],
                        current_feed: {
                            core_exchange_rate: {
                                base: {
                                    amount: 10,
                                    asset_id: '1.3.0',
                                },
                                quote: {
                                    amount: 10,
                                    asset_id: '1.3.0',
                                },
                            },
                        },
                        current_feed_publication_time: '',
                        feed_lifetime_sec: 0,
                        minimum_feeds: 0,
                    },
                };
                break;
            }
            case OperationName.issue_asset: {
                operation = {
                    issuer: '',
                    asset_to_issue: {
                        amount: 10,
                        asset_id: '1.3.0',
                    },
                    issue_to_account: '',
                    memo: {
                        from: '',
                        to: '',
                        nonce: 0,
                        message: []
                    },
                    extensions: {}
                };
                break;
            }
            case OperationName.update_user_issued_asset: {
                operation = {
                    issuer: '',
                    asset_to_update: '',
                    new_description: '',
                    max_supply: 0,
                    core_exchange_rate: {
                        base: {
                            amount: 10,
                            asset_id: '1.3.0',
                        },
                        quote: {
                            amount: 10,
                            asset_id: '1.3.0',
                        },
                    },
                    is_exchangeable: true,
                    new_issuer: '',
                    extensions: {},
                };
                break;
            }
            case OperationName.asset_fund_pools_operation: {
                operation = {
                    from_account: '',
                    uia_asset: {
                        amount: 0,
                        asset_id: '1.3.0',
                    },
                    dct_asset: {
                        amount: 0,
                        asset_id: '1.3.0',
                    }
                };
                break;
            }
            case OperationName.asset_reserve_operation: {
                operation = {
                    payer: '',
                    amount_to_reserve: {
                        amount: 0,
                        asset_id: '1.3.0',
                    },
                    extensions: {}
                };
                break;
            }
            case OperationName.asset_claim_fees_operation: {
                operation = {
                    issuer: '',
                    uia_asset: {
                        amount: 0,
                        asset_id: '1.3.0',
                    },
                    dct_asset: {
                        amount: 0,
                        asset_id: '1.3.0',
                    },
                    extensions: {}
                };
                break;
            }
            case OperationName.leave_rating_and_comment: {
                operation = {
                    URI: '',
                    consumer: '',
                    comment: '',
                    rating: 0,
                };
                break;
            }
            case OperationName.account_create: {
                operation = {
                    fee: {
                        amount: 10,
                        asset_id: '1.3.0'
                    },
                    name: '',
                    owner: {
                        weight_threshold: 0,
                        account_auths: [],
                        key_auths: [['', 0]],
                    },
                    active: {
                        weight_threshold: 0,
                        account_auths: [],
                        key_auths: [['', 0]],
                    },
                    options: {
                        memo_key: '',
                        voting_account: '',
                        num_miner: 0,
                        votes: [],
                        extensions: [],
                        allow_subscription: true,
                        price_per_subscribe: {
                            amount: 10,
                            asset_id: '1.3.0',
                        },
                        subscription_period: 0,
                    },
                    registrar: '',
                    extensions: [],
                };
                break;
            }
            case OperationName.asset_publish_feed: {
                operation = {
                    publisher: '',
                    asset_id: '',
                    feed: {
                        core_exchange_rate: {
                            base: {
                                amount: 10,
                                asset_id: '1.3.0',
                            },
                            quote: {
                                amount: 10,
                                asset_id: '1.3.0',
                            },
                        }
                    },
                    extensions: {}
                };
                break;
            }
            case OperationName.miner_create: {
                operation = {
                    miner_account: '',
                    url: '',
                    block_signing_key: '',
                };
                break;
            }
            case OperationName.miner_update: {
                operation = {
                    miner: '',
                    miner_account: '',
                    new_url: '',
                    new_signing_key: '',
                };
                break;
            }
            case OperationName.miner_update_global_parameters: {
                operation = {
                    new_parameters: {
                        current_fees: {
                            parameters: [[0, {}]],
                            scale: 0,
                        },
                        block_interval: 0,
                        maintenance_interval: 0,
                        maintenance_skip_slots: 0,
                        miner_proposal_review_period: 0,
                        maximum_transaction_size: 0,
                        maximum_block_size: 0,
                        maximum_time_until_expiration: 0,
                        maximum_proposal_lifetime: 0,
                        maximum_asset_feed_publishers: 0,
                        maximum_miner_count: 0,
                        maximum_authority_membership: 0,
                        cashback_vesting_period_seconds: 0,
                        cashback_vesting_threshold: 0,
                        max_predicate_opcode: 0,
                        max_authority_depth: 0,
                        extensions: [],
                    },
                };
                break;
            }
            case OperationName.proposal_create: {
                operation = {
                    fee_paying_account: '',
                    proposed_ops: [{}],
                    expiration_time: '2018-07-04T16:00:00',
                    review_period_seconds: 0,
                    extensions: []
                };
                break;
            }
            case OperationName.proposal_update: {
                operation = {
                    fee_paying_account: '1.2.0',
                    proposal: '1.6.0',
                    active_approvals_to_add: ['', ''],
                    active_approvals_to_remove: ['', ''],
                    owner_approvals_to_add: ['', ''],
                    owner_approvals_to_remove: ['', ''],
                    key_approvals_to_add: ['', ''],
                    key_approvals_to_remove: ['', ''],
                    extensions: []
                };
                break;
            }
            case OperationName.operation_wrapper: {
                operation = {
                    op: {},
                };
                break;
            }
            case OperationName.vesting_balance_withdraw: {
                operation = {
                    vesting_balance: '',
                    owner: '',
                    amount: {
                        amount: 10,
                        asset_id: '1.3.0',
                    }
                };
                break;
            }
            default: {
                operation = 'Operation with name: ' + operationName + ' not found';
                break;
            }
        }
        return operation;
    }
}
