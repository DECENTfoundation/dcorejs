import { Database } from './api/database';
import { ChainApi } from './api/chain';
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
export declare class Asset {
    amount: number;
    asset_id: string;
    static createAsset(amount: number, assetId: string): Asset;
}
export interface Authority {
    weight_threshold: number;
    account_auths: any[];
    key_auths: KeyAuth[];
}
export declare class KeyAuth {
    private _key;
    private _value;
    constructor(key: string, value?: number);
    keyAuthFormat(): any[];
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
export declare class TransactionRecord {
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
    constructor(transaction: any, privateKeys: string[]);
}
export declare class TransactionMemo {
    valid: boolean;
    from: string;
    message: string;
    nonce: string;
    to: string;
    constructor(transaction: any);
    decryptedMessage(privateKeys: string[]): string;
}
export declare class AccountError {
    static account_does_not_exist: string;
    static account_fetch_failed: string;
    static transaction_history_fetch_failed: string;
    static transfer_missing_pkey: string;
    static transfer_sender_account_not_found: string;
    static transfer_receiver_account_not_found: string;
    static database_operation_failed: string;
    static transaction_broadcast_failed: string;
    static account_keys_incorrect: string;
}
export declare class AccountApi {
    private _dbApi;
    private _chainApi;
    constructor(dbApi: Database, chainApi: ChainApi);
    getAccountByName(name: string): Promise<Account>;
    getAccountById(id: string): Promise<Account>;
    getTransactionHistory(accountId: string, privateKeys: string[], order?: string, startObjectId?: string, resultLimit?: number): Promise<TransactionRecord[]>;
    transfer(amount: number, fromAccount: string, toAccount: string, memo: string, privateKey: string): Promise<any>;
    getBalance(accountId: string): Promise<number>;
    private handleError(message, err);
}
