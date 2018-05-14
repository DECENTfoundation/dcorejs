import {Account} from './account';
import {Database, DatabaseApi} from './api/database';
import {ChainApi, ChainMethods} from './api/chain';
import {CryptoUtils} from './crypt';
import {Transaction} from './transaction';
import {KeyPrivate, KeyPublic, Utils} from './utils';
import {HistoryApi, HistoryOperations} from './api/history';
import {ApiConnector} from './api/apiConnector';
import {DatabaseOperations, SearchAccountHistoryOrder, MinerOrder, DatabaseError} from './api/model/database';
import {Memo, Operation, Operations} from './model/transaction';
import {Miner, Space, Type} from './explorer';

export type AccountNameIdPair = [string, string];

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
    key_auths: [[string, number]];
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
    memo_key?: string;
    voting_account?: string;
    num_miner?: number;
    num_witness?: number;
    votes?: any[];
    extensions?: any[];
    allow_subscription?: boolean;
    price_per_subscribe?: Asset;
    subscription_period?: number;
}

export class TransactionRecord {
    id: string;
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
        this.id = transaction.id;
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

export interface HistoryRecord {
    id: string
    op: any[]
    result: any[]
    block_num: number
    trx_in_block: number
    op_in_trx: number
    virtual_op: number
}

export interface WalletExport {
    chain_id: string;
    my_accounts: Account[];
    cipher_keys: string;
    extra_keys: [string, string[]][];
    pending_account_registrations: any[];
    pending_miner_registrations: any[];
    ws_server: string;
    ws_user: string;
    ws_password: string;
}

export interface MinerInfo {
    id: string;
    name: string;
    url: string;
    total_votes: number;
    voted: boolean;
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
    static bad_parameter = 'bad_parameter';
    static history_fetch_failed = 'history_fetch_failed';
    static start_object_id_not_defined = 'start_object_id_not_defined';
    static account_id_invalid_format = 'account_id_invalid_format';
}

export enum AccountOrder {
    nameAsc = '+name',
    idAsc = '+id',
    nameDesc = '-name',
    idDesc = '-id',
}

/**
 * API class provides wrapper for account information.
 */
export class AccountApi {
    private _dbApi: DatabaseApi;
    private _chainApi: ChainApi;
    private _historyApi: HistoryApi;
    private _connector: ApiConnector;

    constructor(dbApi: Database, chainApi: ChainApi, historyApi: HistoryApi, connector: ApiConnector) {
        this._dbApi = dbApi as DatabaseApi;
        this._chainApi = chainApi;
        this._historyApi = historyApi;
        this._connector = connector;
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
     * @deprecated This method will be removed since future DCore update. Use getAccountHistory instead
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
                                 order: SearchAccountHistoryOrder = SearchAccountHistoryOrder.timeDesc,
                                 startObjectId: string = '0.0.0',
                                 resultLimit: number = 100): Promise<TransactionRecord[]> {
        return new Promise((resolve, reject) => {
            this.searchAccountHistory(accountId, privateKeys, order, startObjectId, resultLimit)
                .then((transactions: any[]) => {
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
     * Returns operations on given account.
     *
     * @param {string} accountId
     * @param {string[]} privateKeys
     * @param {string} order
     * @param {string} startObjectId
     * @param {number} resultLimit
     * @returns {Promise<TransactionRecord[]>}
     */
    public searchAccountHistory(accountId: string,
                                privateKeys: string[],
                                order: SearchAccountHistoryOrder = SearchAccountHistoryOrder.timeDesc,
                                startObjectId: string = '0.0.0',
                                resultLimit: number = 100): Promise<TransactionRecord[]> {
        return new Promise((resolve, reject) => {
            const [space, typeProtocol, id] = accountId.split('.');
            if (!(Number(space) === Space.protocol_ids && Number(typeProtocol) === Type.Protocol.account && id)) {
                reject(this.handleError(AccountError.account_id_invalid_format));
                return;
            }
            if (!startObjectId) {
                reject(this.handleError(AccountError.start_object_id_not_defined));
                return;
            }
            const dbOperation = new DatabaseOperations.SearchAccountHistory(
                accountId,
                order,
                startObjectId,
                resultLimit
            );
            this._dbApi.execute(dbOperation)
                .then((transactions: any[]) => {
                    resolve(transactions);
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
     * @return {Promise<Operation>}
     */
    public transfer(amount: number,
                    fromAccount: string,
                    toAccount: string,
                    memo: string,
                    privateKey: string): Promise<Operation> {
        const pKey = Utils.privateKeyFromWif(privateKey);

        return new Promise((resolve, reject) => {
            if (memo && !privateKey) {
                reject(AccountError.transfer_missing_pkey);
            }

            const operations = new ChainMethods();
            operations.add(ChainMethods.getAccount, fromAccount);
            operations.add(ChainMethods.getAccount, toAccount);
            operations.add(ChainMethods.getAsset, ChainApi.asset);

            this._chainApi.fetch(operations)
                .then(result => {
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

                    const transaction = new Transaction();
                    const transferOperation = new Operations.TransferOperation(
                        senderAccount.get('id'),
                        receiverAccount.get('id'),
                        Asset.createAsset(amount, asset.get('id')),
                        memo_object
                    );
                    transaction.add(transferOperation);
                    transaction.broadcast(privateKey)
                        .then(() => {
                            resolve(transaction.operations[0]);
                        })
                        .catch(err => {
                            reject(
                                this.handleError(AccountError.transaction_broadcast_failed, err)
                            );
                        });
                })
                .catch(err => reject(this.handleError(AccountError.account_fetch_failed, err)));
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

    /**
     * Determine if block with transaction is verified and irreversible.
     * Unverified blocks still can be reversed.
     *
     * NOTICE:
     * Transaction object with id in form '1.7.X' can be fetched from AccountApi.getAccountHistory(:)
     * method.
     *
     * @param {string} accountId        User's account id, example: '1.2.30'
     * @param {string} transactionId    Transaction id in format '1.7.X'.
     * @return {Promise<boolean>}
     */
    public isTransactionConfirmed(accountId: string, transactionId: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            let start = transactionId;
            if (transactionId !== '1.7.0') {
                const trNumSplit = transactionId.split('.');
                trNumSplit[2] = `${Number(trNumSplit[2]) - 1}`;
                start = trNumSplit.join('.');
            } else {
                reject(this.handleError(AccountError.bad_parameter, ''));
            }

            const operation = new HistoryOperations.GetAccountHistory(
                accountId,
                start,
                transactionId
            );
            this._historyApi.execute(operation)
                .then(res => {
                    if (res.length === 0) {
                        reject(this.handleError(AccountError.transaction_history_fetch_failed, ''));
                    }
                    const dbOp = new DatabaseOperations.GetDynamicGlobalProperties();
                    this._dbApi.execute(dbOp)
                        .then(props => {
                            resolve(res[0].block_num <= props.last_irreversible_block_num);
                        })
                        .catch(err => reject(this.handleError(AccountError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(AccountError.history_fetch_failed, err)));
        });
    }

    /**
     * List chain operations history list for given user
     * Operations can be filtered using Chain.ChainOperationType
     *
     * @param {string} accountId                Users account id, example: '1.2.30'
     * @param {number} resultLimit              Number of results to be returned, max value is 100
     * @return {Promise<HistoryRecord[]>}       Return variable object types, based on operation in history record
     */
    public getAccountHistory(accountId: string, resultLimit: number = 100): Promise<HistoryRecord[]> {
        return new Promise((resolve, reject) => {
            const operation = new HistoryOperations.GetAccountHistory(
                accountId,
                '1.7.0',
                '1.7.0',
                resultLimit
            );
            this._historyApi.execute(operation)
                .then(res => {
                    // TODO: create models for different operations names, placed in dcore/src/chain/src/ChainTypes.js
                    resolve(res);
                })
                .catch(err => reject(this.handleError(AccountError.transaction_history_fetch_failed, err)));
        });
    }

    /**
     * Vote for selected miner.
     * More information on https://devdocs.decent.ch/UseCases/#vote_for_a_miner_1
     *
     * @param {string} miner
     * @param {string} account
     * @param {string} privateKeyWif
     * @returns {Promise<any>}
     */
    public voteForMiner(miner: string, account: string, privateKeyWif: string): Promise<any> {
        return this.voteForMiners([miner], account, privateKeyWif);
    }

    /**
     * Remove youte vote from selected miner.
     *
     * @param {string} miner
     * @param {string} account
     * @param {string} privateKeyWif
     * @returns {Promise<any>}
     */
    public unvoteMiner(miner: string, account: string, privateKeyWif: string): Promise<any> {
        return this.unvoteMiners([miner], account, privateKeyWif);
    }

    public voteForMiners(miners: string[], account: string, privateKeyWif: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const operations = new ChainMethods();
            operations.add(ChainMethods.getAccount, account);
            this._chainApi.fetch(operations)
                .then(res => {
                    const [voterAccount] = res;
                    const voter: Account = JSON.parse(JSON.stringify(voterAccount));
                    const operation = new DatabaseOperations.GetMiners(miners);
                    this._dbApi.execute(operation)
                        .then((res: Miner[]) => {
                            voter.options.votes.push(...res.map(miner => miner.vote_id));
                            voter.options.votes.sort((e1: string, e2: string) => {
                                return Number(e1.split(':')[1]) - Number(e2.split(':')[1]);
                            });
                            voter.options['num_witness'] = voter.options.num_miner;
                            delete voter.options.num_miner;
                            const op = new Operations.AccountUpdateOperation(
                                account,
                                voter.owner,
                                voter.active,
                                voter.options,
                                {}
                            );
                            const transaction = new Transaction();
                            transaction.add(op);
                            transaction.broadcast(privateKeyWif)
                                .then(res => resolve(res))
                                .catch(err => reject(err));
                        })
                        .catch(err => reject(this.handleError(AccountError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(AccountError.account_fetch_failed, err)));
        });
    }

    public unvoteMiners(miners: string[], account: string, privateKeyWif: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const operations = new ChainMethods();
            operations.add(ChainMethods.getAccount, account);
            this._chainApi.fetch(operations)
                .then(res => {
                    const [voterAccount] = res;
                    const voter: Account = JSON.parse(JSON.stringify(voterAccount));
                    const operation = new DatabaseOperations.GetMiners(miners);
                    this._dbApi.execute(operation)
                        .then((res: Miner[]) => {
                            res.forEach(miner => {
                                const voteIndex = voter.options.votes.indexOf(miner.vote_id);
                                voter.options.votes.splice(voteIndex, 1);
                            });
                            voter.options['num_witness'] = voter.options.num_miner;
                            delete voter.options.num_miner;
                            const op = new Operations.AccountUpdateOperation(
                                account,
                                voter.owner,
                                voter.active,
                                voter.options,
                                {}
                            );
                            const transaction = new Transaction();
                            transaction.add(op);
                            transaction.broadcast(privateKeyWif)
                                .then(res => resolve(res))
                                .catch(err => reject(err));
                        })
                        .catch(err => reject(this.handleError(AccountError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(AccountError.account_fetch_failed, err)));
        });
    }

    /**
     * Search accounts based on given parameters
     *
     * @param {string} searchTerm
     * @param {string} order
     * @param {string} id
     * @param {number} limit
     * @returns {Promise<Account>}
     */
    public searchAccounts(searchTerm: string, order: AccountOrder, id: string, limit: number = 100): Promise<Account> {
        return new Promise<Account>((resolve, reject) => {
            const operation = new DatabaseOperations.SearchAccounts(searchTerm, order, id, limit);
            this._dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    /**
     * Returns number of accounts created on network
     *
     * @returns {Promise<number>}
     */
    public getAccountCount(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const operation = new DatabaseOperations.GetAccountCount();
            this._dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    /**
     * Creates new account in network.
     *
     * @param {string} name                 Name of newly created account.
     * @param {string} ownerKey             Public key to be used as owner key.
     * @param {string} activeKey            Public key to be used as active key.
     * @param {string} memoKey              Public key used to memo encryption.
     * @param {string} registrar            Registrar account id who pay account creation transaction
     * @param {string} regisrarPrivateKey   Registrar private key for account register transaction to be signed with
     * @returns {Promise<boolean>}
     */
    public registerAccount(name: string,
                           ownerKey: string,
                           activeKey: string,
                           memoKey: string,
                           registrar: string,
                           regisrarPrivateKey: string): Promise<boolean> {
        const ownerKeyAuths: [[string, number]] = [] as [[string, number]];
        ownerKeyAuths.push([ownerKey, 1]);
        const activeKeyAuths: [[string, number]] = [] as [[string, number]];
        activeKeyAuths.push([activeKey, 1]);
        const owner = {
            weight_threshold: 1,
            account_auths: [],
            key_auths: ownerKeyAuths
        };
        const active = {
            weight_threshold: 1,
            account_auths: [],
            key_auths: activeKeyAuths
        };
        return new Promise<boolean>((resolve, reject) => {
            this._connector.connect()
                .then(() => {
                    const operation = new Operations.RegisterAccount({
                        name,
                        owner,
                        active,
                        registrar,
                        options: {
                            memo_key: memoKey,
                            voting_account: '1.2.3',
                            allow_subscription: false,
                            price_per_subscribe: Asset.createAsset(0, '1.3.0'),
                            num_witness: 0,
                            votes: [],
                            extensions: [],
                            subscription_period: 0,
                        }
                    });

                    const transaction = new Transaction();
                    transaction.add(operation);
                    transaction.broadcast(regisrarPrivateKey)
                        .then(() => resolve(true))
                        .catch(err => reject(err));
                })
                .catch(err => console.log(err));
        });
    }

    /**
     * Create account with keys derived from provided brain key.
     *
     * NOTE: This method create account with owner, active and memo key set to same value.
     *       Use of helper methods from Utils to derive keys from brainkey and then register account
     *       with option to set these keys to different values.
     *
     * @param {string} brainkey             Brain key for keys derivation
     * @param {string} accountName          Name for new account
     * @param {string} registrar            Registrar account id, who pay for account registration
     * @param {string} registrarPrivateKey  Registrar private key in WIF
     * @returns {Promise<boolean>}
     */
    public createAccountWithBrainkey(brainkey: string,
                                     accountName: string,
                                     registrar: string,
                                     registrarPrivateKey: string): Promise<boolean> {
        const normalizedBrainkey = Utils.normalize(brainkey);
        const keyPair: [KeyPrivate, KeyPublic] = Utils.generateKeys(normalizedBrainkey);
        return this.registerAccount(
            accountName,
            keyPair[1].stringKey,
            keyPair[1].stringKey,
            keyPair[1].stringKey,
            registrar,
            registrarPrivateKey);
    }

    /**
     * Exports wallet-cli compatible wallet file.
     *
     * @param {string} accountId
     * @param {string} password
     * @param {string} elGamalPrivateKey
     * @param {string} elGamalPublicKey
     * @param {string} privateKeys
     * @returns {Promise<any>}
     */
    exportWallet(accountId: string,
                 password: string,
                 elGamalPrivateKey: string,
                 elGamalPublicKey: string,
                 ...privateKeys: string[]): Promise<any> {
        return new Promise((resolve, reject) => {
            this.getAccountById(accountId)
                .then((acc) => {
                    if (!acc) {
                        reject(this.handleError(AccountError.account_does_not_exist, ''));
                        return;
                    }
                    const walletExport: WalletExport = {
                        chain_id: this._chainApi.chainId,
                        my_accounts: [acc],
                        cipher_keys: '',
                        extra_keys: [],
                        pending_account_registrations: [],
                        pending_miner_registrations: [],
                        ws_server: this._connector.apiAddresses[0],
                        ws_user: '',
                        ws_password: '',
                    };
                    const keys = {
                        ec_keys: privateKeys.map(pk => {
                            const pubKey = Utils.getPublicKey(Utils.privateKeyFromWif(pk));
                            return [pubKey.stringKey, pk];
                        }),
                        el_gamal_keys: [
                            [{s: elGamalPrivateKey}, {s: elGamalPublicKey}]
                        ],
                        checksum: CryptoUtils.sha512(password)
                    };
                    console.log(keys);
                    walletExport.cipher_keys = CryptoUtils.encryptToHexString(JSON.stringify(keys), password);
                    resolve(walletExport);
                })
                .catch(err => reject(this.handleError(AccountError.database_operation_failed, err)));
        });
    }

    /**
     * Fetch list of an accounts that begins from lower bound account id.
     * If empty string or '1.2.0' is entered, account are listed from the beginning.
     *
     * @param {string} loweBound                Account id from which accounts are listed.
     * @param {number} limit                    Number of returned accounts
     * @returns {Promise<AccountNameIdPair>}    Listed accounts.
     */
    public listAccounts(loweBound: string = '', limit: number = 100): Promise<AccountNameIdPair> {
        return new Promise<AccountNameIdPair>((resolve, reject) => {
            const operation = new DatabaseOperations.LookupAccounts(loweBound, limit);
            this._dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(AccountError.database_operation_failed, err)));
        });
    }

    /**
     * Returns account's balances in all assets account have non-zero amount in.
     *
     * @param {string} id           Account id
     * @returns {Promise<Asset[]>}  List of balances
     */
    public listAccountBalances(id: string): Promise<Asset[]> {
        return new Promise<Asset[]>((resolve, reject) => {
            const operation = new DatabaseOperations.GetAccountBalances(id, []);
            this._dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(AccountError.database_operation_failed, err)));
        });
    }

    /**
     * Search for miners with parameters.
     *
     * @param {string} accountName          Account name to search miners for. If not using myVotes, searching in all miners
     * @param {string} keyword              Search keyword.
     * @param {boolean} myVotes             Flag to search within account's voted miners.
     * @param {MinerOrder} sort             Sorting parameter of search results.
     * @param {string} fromMinerId          Miner id to start form. Use for paging.
     * @param {number} limit                Result count. Default and max is 1000
     * @returns {Promise<MinerInfo[]>}
     */
    public searchMinerVoting(accountName: string,
                             keyword: string,
                             myVotes: boolean,
                             sort: MinerOrder,
                             fromMinerId: string,
                             limit: number = 1000): Promise<MinerInfo[]> {
        return new Promise<MinerInfo[]>((resolve, reject) => {
            const operation = new DatabaseOperations.SearchMinerVoting(
                accountName,
                keyword,
                myVotes,
                sort,
                fromMinerId,
                limit);
            this._dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => {
                    reject(this.handleError(DatabaseError.database_execution_failed, err));
                });
        });
    }

    private handleError(message: string, err?: any): Error {
        const error = new Error(message);
        error.stack = err;
        return error;
    }
}
