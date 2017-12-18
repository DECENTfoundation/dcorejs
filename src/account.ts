import {Database, DatabaseApi, DatabaseOperations, SearchAccountHistoryOrder} from './api/database';
import { ChainApi, ChainMethods } from './api/chain';
import {CryptoUtils} from './crypt';
import {Memo, OperationName, Transaction, TransferOperation} from './transaction';
import {KeyPrivate, Utils} from './utils';

export interface TransactionRaw {
    id: string;
    m_from_account: string;
    m_operation_type: number;
    m_str_description: string;
    m_timestamp: string;
    m_to_account: string;
    m_transaction_amount: Asset;
    m_transaction_fee: Asset;
}

export interface Account {
    id: string;
    registrar: string;
    name: string;
    owner: Authority;
    active: Authority;
    options: Options;
    rights_to_publish: PublishRights;
    statistics: string;
    top_n_control_flags: number;
}

export interface PublishRights {
    is_publishing_manager: boolean;
    publishing_rights_received: any[];
    publishing_rights_forwarded: any[];
}

export class Asset {
    amount: number;
    asset_id: string;

    public static createAsset(amount: number, assetId: string): Asset {
        return {
            amount: Math.floor(amount * ChainApi.DCTPower),
            asset_id: assetId
        };
    }
}

export interface Authority {
    weight_threshold: number;
    account_auths: any[];
    key_auths: KeyAuth[];
}

export class KeyAuth {
    private _key: string;
    private _value: number;

    constructor(key: string, value: number = 1) {
        this._key = key;
        this._value = value;
    }

    public keyAuthFormat(): any[] {
        return [this._key, this._value];
    }
}

export interface Options {
    memo_key: string;
    voting_account: string;
    num_miner: number;
    votes: any[];
    extensions: any[];
    allow_subscription: boolean;
    price_per_subscribe: Asset;
    subscription_period: number;
}

export class TransactionRecord {
    fromAccountName: string;
    toAccountName: string;
    fromAccountId: string;
    toAccountId: string;
    operationType: number;
    transactionAmount: number;
    transactionFee: number;
    description: string;
    timestamp: string;
    memo: TransactionMemo;
    memoString: string;

    constructor(transaction: any, privateKeys: string[]) {
        this.fromAccountId = transaction.m_from_account;
        this.toAccountId = transaction.m_to_account;
        this.operationType = transaction.m_operation_type;
        this.transactionAmount = transaction.m_transaction_amount.amount;
        this.transactionFee = transaction.m_transaction_fee.amount;
        this.description = transaction.m_str_description;
        this.timestamp = transaction.m_timestamp;
        this.memo = new TransactionMemo(transaction);
        this.memoString = this.memo.decryptedMessage(privateKeys);
    }
}

export class TransactionMemo {
    valid: boolean;
    from: string;
    message: string;
    nonce: string;
    to: string;

    constructor(transaction: any) {
        if (!transaction.m_transaction_encrypted_memo) {
            this.valid = false;
        } else {
            this.valid = true;
            this.from = transaction.m_transaction_encrypted_memo.from;
            this.message = transaction.m_transaction_encrypted_memo.message;
            this.nonce = transaction.m_transaction_encrypted_memo.nonce;
            this.to = transaction.m_transaction_encrypted_memo.to;
        }
    }

    decryptedMessage(privateKeys: string[]): string {
        if (!this.valid) {
            return '';
        }
        const pubKey = Utils.publicKeyFromString(this.to);
        let decrypted = '';

        privateKeys.forEach(pk => {
            let pKey: KeyPrivate;
            try {
                pKey = Utils.privateKeyFromWif(pk);
                try {
                    decrypted = CryptoUtils.decryptWithChecksum(this.message, pKey, pubKey, this.nonce).toString();
                } catch (err) {
                    throw new Error(AccountError.account_keys_incorrect);
                }
            } catch (err) {
            }
        });
        return decrypted;
    }
}

export class AccountError {
    static account_does_not_exist = 'account_does_not_exist';
    static account_fetch_failed = 'account_fetch_failed';
    static transaction_history_fetch_failed = 'transaction_history_fetch_failed';
    static transfer_missing_pkey = 'transfer_missing_pkey';
    static transfer_sender_account_not_found = 'transfer_sender_account_not_found';
    static transfer_receiver_account_not_found = 'transfer_receiver_account_not_found';
    static database_operation_failed = 'database_operation_failed';
    static transaction_broadcast_failed = 'transaction_broadcast_failed';
    static account_keys_incorrect = 'account_keys_incorrect';
}

/**
 * API class provides wrapper for account information.
 */
export class AccountApi {
    private _dbApi: DatabaseApi;
    private _chainApi: ChainApi;

    constructor(dbApi: Database, chainApi: ChainApi) {
        this._dbApi = dbApi as DatabaseApi;
        this._chainApi = chainApi;
    }

    /**
     * Gets chain account for given Account name.
     *
     * @param {string} name         example: "u123456789abcdef123456789"
     * @return {Promise<Account>}
     */
    public getAccountByName(name: string): Promise<Account> {
        const dbOperation = new DatabaseOperations.GetAccountByName(name);
        return new Promise((resolve, reject) => {
            this._dbApi.execute(dbOperation)
                .then((account: Account) => {
                    resolve(account as Account);
                })
                .catch(err => {
                    reject(this.handleError(AccountError.account_fetch_failed, err));
                });
        });
    }

    /**
     * Gets chain account for given Account id.
     *
     * @param {string} id           example: "1.2.345"
     * @return {Promise<Account>}
     */
    public getAccountById(id: string): Promise<Account> {
        const dbOperation = new DatabaseOperations.GetAccounts([id]);
        return new Promise((resolve, reject) => {
            this._dbApi.execute(dbOperation)
                .then((accounts: Account[]) => {
                    if (accounts.length === 0) {
                        reject(
                            this.handleError(AccountError.account_does_not_exist, `${id}`)
                        );
                    }
                    const [account] = accounts;
                    resolve(account as Account);
                })
                .catch(err => {
                    reject(this.handleError(AccountError.account_fetch_failed, err));
                });
        });
    }

    /**
     * Gets transaction history for given Account name.
     *
     * @param {string} accountId                example: "1.2.345"
     * @param {string} order                    SearchAccountHistoryOrder class holds all available options.
     *                                          Default SearchParamsOrder.createdDesc
     * @param {string[]} privateKeys            Array of private keys in case private/public pair has been changed
     *                                          to be able of decrypt older memo messages from transactions.
     * @param {string} startObjectId            Id of object to start search from for paging purposes. Default 0.0.0
     * @param {number} resultLimit              Number of returned transaction history records for paging. Default 100(max)
     * @return {Promise<TransactionRecord[]>}
     */
    public getTransactionHistory(accountId: string,
                                 privateKeys: string[],
                                 order: string = SearchAccountHistoryOrder.timeDesc,
                                 startObjectId: string = '0.0.0',
                                 resultLimit: number = 100): Promise<TransactionRecord[]> {
        return new Promise((resolve, reject) => {
            const dbOperation = new DatabaseOperations.SearchAccountHistory(
                accountId,
                order,
                startObjectId,
                resultLimit
            );
            this._dbApi.execute(dbOperation)
                .then((transactions: any[]) => {
                    console.log(transactions);
                    const namePromises: Promise<string>[] = [];
                    const res = transactions.map((tr: any) => {
                        const transaction = new TransactionRecord(tr, privateKeys);

                        namePromises.push(new Promise((resolve, reject) => {
                            this.getAccountById(transaction.fromAccountId)
                                .then(account => {
                                    transaction.fromAccountName = account.name;
                                    resolve();
                                })
                                .catch(err => reject(this.handleError(AccountError.account_fetch_failed, err)));
                        }));

                        namePromises.push(new Promise((resolve, reject) => {
                            this.getAccountById(transaction.toAccountId)
                                .then(account => {
                                    transaction.toAccountName = account.name;
                                    resolve();
                                })
                                .catch(err => reject(this.handleError(AccountError.account_fetch_failed, err)));
                        }));

                        return transaction;
                    });
                    Promise.all(namePromises)
                        .then(() => {
                            resolve(res);
                        })
                        .catch(err => {
                            reject(this.handleError(AccountError.account_fetch_failed, err));
                        });
                })
                .catch(err => {
                    reject(
                        this.handleError(AccountError.transaction_history_fetch_failed, err)
                    );
                });
        });
    }

    /**
     * Transfers exact amount of DCT between accounts with optional
     * message for recipient
     *
     * @param {number} amount
     * @param {string} fromAccount      Name or id of account
     * @param {string} toAccount        Name or id of account
     * @param {string} memo             Message for recipient
     * @param {string} privateKey       Private key used to encrypt memo and sign transaction
     */
    public transfer(amount: number,
                    fromAccount: string,
                    toAccount: string,
                    memo: string,
                    privateKey: string): Promise<void> {
        const pKey = Utils.privateKeyFromWif(privateKey);

        return new Promise((resolve, reject) => {
            if (memo && !privateKey) {
                reject(AccountError.transfer_missing_pkey);
            }

            if (!toAccount.startsWith('u')) {
                toAccount = `u${CryptoUtils.md5(toAccount)}`;
            }

            const operations = new ChainMethods();
            operations.add(ChainMethods.getAccount, fromAccount);
            operations.add(ChainMethods.getAccount, toAccount);
            operations.add(ChainMethods.getAsset, ChainApi.asset);

            this._chainApi.fetch(operations).then(result => {
                const [senderAccount, receiverAccount, asset] = result;
                if (!senderAccount) {
                    reject(
                        this.handleError(
                            AccountError.transfer_sender_account_not_found,
                            `${fromAccount}`
                        )
                    );
                }
                if (!receiverAccount) {
                    reject(
                        this.handleError(
                            AccountError.transfer_receiver_account_not_found,
                            `${toAccount}`
                        )
                    );
                }

                const nonce: string = ChainApi.generateNonce();
                const fromPublicKey = senderAccount.get('options').get('memo_key');
                const toPublicKey = receiverAccount.get('options').get('memo_key');

                const pubKey = Utils.publicKeyFromString(toPublicKey);

                const memo_object: Memo = {
                    from: fromPublicKey,
                    to: toPublicKey,
                    nonce: nonce,
                    message: CryptoUtils.encryptWithChecksum(
                        memo,
                        pKey,
                        pubKey,
                        nonce
                    )
                };

                const transfer: TransferOperation = {
                    from: senderAccount.get('id'),
                    to: receiverAccount.get('id'),
                    amount: Asset.createAsset(amount, asset.get('id')),
                    memo: memo_object
                };

                const transaction = new Transaction();
                transaction.addOperation({
                    name: OperationName.transfer,
                    operation: transfer
                });
                transaction.broadcast(privateKey)
                    .then(res => {
                        resolve();
                    })
                    .catch(err => {
                        reject(
                            this.handleError(AccountError.transaction_broadcast_failed, err)
                        );
                    });
            });
        });
    }

    /**
     * Current account balance of DCT asset on given account
     *
     * @param {string} accountId    Account id, example: '1.2.345'
     * @return {Promise<number>}
     */
    public getBalance(accountId: string): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject('missing_parameter');
                return;
            }
            const dbOperation = new DatabaseOperations.GetAccountBalances(accountId, [
                ChainApi.asset_id
            ]);
            this._dbApi.execute(dbOperation)
                .then(res => {
                    resolve(res[0].amount / ChainApi.DCTPower);
                })
                .catch(err => {
                    reject(this.handleError(AccountError.database_operation_failed, err));
                });
        });
    }

    private handleError(message: string, err: any): Error {
        const error = new Error(message);
        error.stack = err;
        return error;
    }
}
