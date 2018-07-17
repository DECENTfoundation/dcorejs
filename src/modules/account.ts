import {
    Account,
    AccountError,
    AccountNameIdPair,
    Asset, HistoryRecord,
    MinerInfo,
    TransactionRecord,
    WalletExport,
    HistoryOptions, UpdateAccountParameters, Authority, Options
} from '../model/account';
import { DatabaseApi } from '../api/database';
import { ChainApi} from '../api/chain';
import { CryptoUtils } from '../crypt';
import { TransactionBuilder } from '../transactionBuilder';
import { KeyPrivate, KeyPublic, Utils } from '../utils';
import { HistoryApi, HistoryOperations } from '../api/history';
import { ApiConnector } from '../api/apiConnector';
import { DatabaseError, DatabaseOperations, MinerOrder, SearchAccountHistoryOrder } from '../api/model/database';
import { Memo, Operation, Operations } from '../model/transaction';
import { ApiModule } from './ApiModule';
import { DCoreAssetObject } from '../model/asset';
import {ChainMethods} from '../api/model/chain';

export enum AccountOrder {
    nameAsc = '+name',
    idAsc = '+id',
    nameDesc = '-name',
    idDesc = '-id',
    none = ''
}

/**
 * API class provides wrapper for account information.
 */
export class AccountModule extends ApiModule {
    constructor(dbApi: DatabaseApi, chainApi: ChainApi, historyApi: HistoryApi, apiConnector: ApiConnector) {
        super({
            dbApi,
            apiConnector,
            historyApi,
            chainApi
        });
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
            this.dbApi.execute(dbOperation)
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
            this.dbApi.execute(dbOperation)
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
     * @deprecated This method will be removed in future DCore update. Use getAccountHistory or searchAccountHistory instead
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
     * Returns transfer operations for given account.
     *
     * @param {string} accountId
     * @param {string[]} privateKeys
     * @param {string} order
     * @param {string} startObjectId
     * @param {number} resultLimit
     * @param {boolean} convertAssets
     * @returns {Promise<TransactionRecord[]>}
     */
    public searchAccountHistory(accountId: string,
                                privateKeys: string[],
                                order: SearchAccountHistoryOrder = SearchAccountHistoryOrder.timeDesc,
                                startObjectId: string = '0.0.0',
                                resultLimit: number = 100,
                                convertAssets: boolean = false): Promise<TransactionRecord[]> {
        return new Promise<TransactionRecord[]>((resolve, reject) => {
            const dbOperation = new DatabaseOperations.SearchAccountHistory(
                accountId,
                order,
                startObjectId,
                resultLimit
            );
            this.dbApi.execute(dbOperation)
                .then((transactions: any[]) => {
                    const listAssetsOp = new DatabaseOperations.ListAssets('', 100);
                    this.dbApi.execute(listAssetsOp)
                        .then((assets: DCoreAssetObject[]) => {
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

                                if (convertAssets) {
                                    const asset = assets.find(a => a.id === transaction.transactionAsset);
                                    const feeAsset = assets.find(a => a.id === transaction.transactionFeeAsset);
                                    transaction.transactionAmount = Utils.formatAmountForAsset(transaction.transactionAmount, asset);
                                    transaction.transactionFee = Utils.formatAmountForAsset(transaction.transactionFee, feeAsset);
                                }
                                return transaction;
                            });
                            Promise.all(namePromises)
                                .then(() => {
                                    resolve(res);
                                })
                                .catch(err => reject(this.handleError(AccountError.account_fetch_failed, err)));
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
     * @param {string} assetId          Id of asset amount will be send. If empty, default 1.3.0 - DCT is selected
     * @param {string} fromAccount      Name or id of account
     * @param {string} toAccount        Name or id of account
     * @param {string} memo             Message for recipient
     * @param {string} privateKey       Private key used to encrypt memo and sign transaction
     * @param {boolean} broadcast       true iftransaction should be broadcasted
     * @return {Promise<Operation>}
     */
    public transfer(amount: number, assetId: string, fromAccount: string, toAccount: string, memo: string, privateKey: string,
                    broadcast: boolean = true): Promise<Operation> {
        const pKey = Utils.privateKeyFromWif(privateKey);

        return new Promise((resolve, reject) => {
            if (memo && !privateKey) {
                reject(AccountError.transfer_missing_pkey);
            }
            const methods = [].concat(
                new ChainMethods.GetAccount(fromAccount),
                new ChainMethods.GetAccount(toAccount),
                new ChainMethods.GetAsset(assetId || '1.3.0')
            );

            this.chainApi.fetch(...methods)
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
                    const assetObject = JSON.parse(JSON.stringify(asset));
                    const transaction = new TransactionBuilder();
                    const transferOperation = new Operations.TransferOperation(
                        senderAccount.get('id'),
                        receiverAccount.get('id'),
                        Asset.create(amount, assetObject),
                        memo_object
                    );
                    const added = transaction.addOperation(transferOperation);
                    if (added === '') {
                        if (broadcast) {
                            transaction.broadcast(privateKey)
                                .then(() => {
                                    resolve(transaction.operations[0]);
                                })
                                .catch(err => {
                                    reject(this.handleError(AccountError.transaction_broadcast_failed, err));
                                    return;
                                });
                        } else {
                            resolve(transaction.operations[0]);
                        }
                    } else {
                        reject(this.handleError(AccountError.syntactic_error, added));
                        return;
                    }
                })
                .catch(err => reject(this.handleError(AccountError.account_fetch_failed, err)));
        });
    }

    /**
     * Current account balance of DCT asset on given account
     *
     * @param {string} accountId    Account id, example: '1.2.345'
     * @param {string} assetId      Id of asset in which balance will be listed
     * @param convertAsset
     * @return {Promise<number>}
     */
    public getBalance(accountId: string, assetId: string = '1.3.0', convertAsset: boolean = false): Promise<number> {
        return new Promise((resolve, reject) => {
            if (!accountId) {
                reject('missing_parameter');
                return;
            }
            const getAssetOp = new DatabaseOperations.GetAssets([assetId || '1.3.0']);
            this.dbApi.execute(getAssetOp)
                .then((assets: DCoreAssetObject[]) => {
                    if (!assets || assets.length === 0) {
                        reject(this.handleError(DatabaseError.asset_fetch_failed));
                        return;
                    }
                    const asset = assets[0];
                    const dbOperation = new DatabaseOperations.GetAccountBalances(accountId, [asset.id]);
                    this.dbApi.execute(dbOperation)
                        .then(balances => {
                            if (!balances || !balances[0]) {
                                reject(this.handleError(AccountError.asset_does_not_exist));
                                return;
                            }
                            const [balance] = balances;
                            resolve(convertAsset ? Utils.formatAmountForAsset(balance.amount, asset) : balance.amount);
                        })
                        .catch(err => {
                            reject(this.handleError(AccountError.database_operation_failed, err));
                        });
                })
                .catch(err => this.handleError(DatabaseError.database_execution_failed, err));
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
            this.historyApi.execute(operation)
                .then(res => {
                    if (res.length === 0) {
                        reject(this.handleError(AccountError.transaction_history_fetch_failed, 'No transactions found'));
                    }
                    const dbOp = new DatabaseOperations.GetDynamicGlobalProperties();
                    this.dbApi.execute(dbOp)
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
     * @param {string} fromId                   ID of operation from what to start list from. Note, that list is in DESC order.
     *                                          So id of operation suppose to be last in received list.
     * @param {number} resultLimit              Number of results to be returned, max value is 100
     * @return {Promise<HistoryRecord[]>}       Return variable object types, based on operation in history record
     */
    public getAccountHistory(accountId: string, historyOptions?: HistoryOptions): Promise<HistoryRecord[]> {
        return new Promise((resolve, reject) => {
            const operation = new HistoryOperations.GetAccountHistory(
                accountId,
                '1.7.0',
                historyOptions && historyOptions.fromId || '1.7.0',
                historyOptions && historyOptions.resultLimit || 100
            );
            this.historyApi.execute(operation)
                .then(res => {
                    // TODO: create models for different operations names, placed in dcore/src/chain/src/ChainTypes.js
                    resolve(res);
                })
                .catch(err => reject(this.handleError(AccountError.transaction_history_fetch_failed, err)));
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
            this.dbApi.execute(operation)
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
            this.dbApi.execute(operation)
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
     * @param {string} registrarPrivateKey   Registrar private key for account register transaction to be signed with
     * @param {boolean} broadcast           If true, transaction is broadcasted, otherwise is not
     * @returns {Promise<boolean>}
     */
    public registerAccount(name: string,
        ownerKey: string,
        activeKey: string,
        memoKey: string,
        registrar: string,
        registrarPrivateKey: string,
        broadcast: boolean = true): Promise<Operation> {
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
        return new Promise<Operation>((resolve, reject) => {
            this.apiConnector.connect()
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
                            price_per_subscribe: Asset.createDCTAsset(0),
                            num_miner: 0,
                            votes: [],
                            extensions: [],
                            subscription_period: 0,
                        }
                    });
                    const transaction = new TransactionBuilder();
                    const added = transaction.addOperation(operation);
                    if (added === '') {
                        if (broadcast) {
                            transaction.broadcast(registrarPrivateKey)
                                .then(() => resolve(transaction.operations[0]))
                                .catch(err => reject(err));
                        } else {
                            resolve(transaction.operations[0]);
                        }
                    } else {
                        reject(this.handleError(AccountError.syntactic_error, added));
                    }
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
        registrarPrivateKey: string): Promise<Operation> {
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
     * @param privateKeys
     * @param additionalElGamalPrivateKeys
     * @returns {Promise<any>}
     */
    exportWallet(accountId: string,
        password: string,
        privateKeys: string[],
        additionalElGamalPrivateKeys: string[] = []): Promise<WalletExport> {
        return new Promise((resolve, reject) => {
            this.getAccountById(accountId)
                .then((acc) => {
                    if (!acc) {
                        reject(this.handleError(AccountError.account_does_not_exist, ''));
                        return;
                    }
                    const elGamalKeys = privateKeys.map(pk => {
                        const elGPriv = Utils.elGamalPrivate(pk);
                        const elGPub = Utils.elGamalPublic(elGPriv);
                        return {
                            private: { s: elGPriv },
                            public: { s: elGPub }
                        };
                    });
                    elGamalKeys.push(...additionalElGamalPrivateKeys.map(elGPriv => {
                        const elGPub = Utils.elGamalPublic(elGPriv);
                        return {
                            private: { s: elGPriv },
                            public: { s: elGPub }
                        };
                    }));
                    const walletExport: WalletExport = {
                        version: 1,
                        chain_id: this.chainApi.chainId,
                        my_accounts: [acc],
                        cipher_keys: '',
                        extra_keys: [],
                        pending_account_registrations: [],
                        pending_miner_registrations: [],
                        ws_server: this.apiConnector.apiAddresses[0],
                        ws_user: '',
                        ws_password: '',
                    };
                    const keys = {
                        ec_keys: privateKeys.map(pk => {
                            const pubKey = Utils.getPublicKey(Utils.privateKeyFromWif(pk));
                            return [pubKey.stringKey, pk];
                        }),
                        el_gamal_keys: elGamalKeys,
                        checksum: CryptoUtils.sha512(password)
                    };
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
     * @param {string} lowerBound                Account id from which accounts are listed.
     * @param {number} limit                    Number of returned accounts
     * @returns {Promise<AccountNameIdPair>}    Listed accounts.
     */
    public listAccounts(lowerBound: string = '', limit: number = 100): Promise<AccountNameIdPair[]> {
        return new Promise<AccountNameIdPair[]>((resolve, reject) => {
            const operation = new DatabaseOperations.LookupAccounts(lowerBound, limit);
            this.dbApi.execute(operation)
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
    public listAccountBalances(id: string, convertAssets: boolean = false): Promise<Asset[]> {
        return new Promise<Asset[]>((resolve, reject) => {
            const operation = new DatabaseOperations.GetAccountBalances(id, []);
            this.dbApi.execute(operation)
                .then((balances: Asset[]) => {
                    if (balances.length === 0) {
                        resolve(balances);
                        return;
                    }
                    const listAssetsOp = new DatabaseOperations.GetAssets(balances.map(asset => asset.asset_id));
                    this.dbApi.execute(listAssetsOp)
                        .then((assets: DCoreAssetObject[]) => {
                            if (!assets || assets.length === 0) {
                                reject(this.handleError(AccountError.database_operation_failed));
                                return;
                            }
                            if (!convertAssets) {
                                resolve(balances);
                                return;
                            }
                            const result = [].concat(...balances);
                            result.forEach(bal => {
                                const asset = assets.find(a => a.id === bal.asset_id);
                                bal.amount = Utils.formatAmountForAsset(bal.amount, asset);
                            });
                            resolve(result);
                        })
                        .catch(err => reject(this.handleError(AccountError.database_operation_failed, err)));
                })
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
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => {
                    reject(this.handleError(DatabaseError.database_execution_failed, err));
                });
        });
    }

    public updateAccount(accountId: string, params: UpdateAccountParameters, privateKey: string, broadcast: boolean = true)
        : Promise<Operation> {
        return new Promise<Operation>(((resolve, reject) => {

            this.getAccountById(accountId)
                .then((account: Account) => {
                    if (account === null) {
                        reject(this.handleError(AccountError.account_does_not_exist));
                        return;
                    }
                    const ownerAuthority: Authority = Object.assign({}, account.owner);
                    ownerAuthority.key_auths[0][0] = params.newOwnerKey || account.owner.key_auths[0][0];

                    const activeAuthority: Authority = Object.assign({}, account.active);
                    activeAuthority.key_auths[0][0] = params.newActiveKey || account.active.key_auths[0][0];

                    let priceSubscription = Object.assign({}, account.options.price_per_subscribe);
                    if (params.newSubscription !== undefined) {
                        priceSubscription = Asset.createDCTAsset(params.newSubscription.pricePerSubscribeAmount);
                    }

                    const newOptions: Options = {
                        memo_key: params.newMemoKey || account.options.memo_key,
                        voting_account: account.options.voting_account,
                        num_miner: params.newNumMiner || account.options.num_miner,
                        votes: params.newVotes || account.options.votes,
                        extensions: account.options.extensions,
                        allow_subscription: params.newSubscription
                            ? params.newSubscription.allowSubscription
                            : account.options.allow_subscription,
                        price_per_subscribe: priceSubscription,
                        subscription_period: params.newSubscription
                            ? params.newSubscription.subscriptionPeriod
                            : account.options.subscription_period
                    };
                    const accountUpdateOperation = new Operations.AccountUpdateOperation(
                        accountId,
                        ownerAuthority,
                        activeAuthority,
                        newOptions,
                        {}
                    );

                    const transaction = new TransactionBuilder();
                    const added = transaction.addOperation(accountUpdateOperation);
                    if (added === '') {
                        if (broadcast) {
                            transaction.broadcast(privateKey)
                                .then(() => {
                                    resolve(transaction.operations[0]);
                                })
                                .catch((error: any) => {
                                    reject(this.handleError(AccountError.transaction_broadcast_failed, error));
                                });
                        } else {
                            resolve(transaction.operations[0]);
                        }
                    } else {
                        reject(this.handleError(AccountError.syntactic_error, added));
                        return;
                    }
                    })
                .catch((error) => {
                    reject(this.handleError(AccountError.account_update_failed, error));
                });

        }));
    }
}
