import { Observable } from 'rxjs/Observable';
import { Database } from './api/database';
import { ChainApi } from './api/chain';
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
export interface Asset {
    amount: number;
    asset_id: string;
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
export declare class Transaction {
    m_from_account_name: Observable<string>;
    m_to_account_name: Observable<string>;
    m_from_account: string;
    m_to_account: string;
    m_operation_type: number;
    m_transaction_amount: number;
    m_transaction_fee: number;
    m_str_description: string;
    m_timestamp: string;
    m_memo: TransactionMemo;
    m_memo_string: string;
    constructor(transaction: any);
}
export declare class TransactionMemo {
    valid: boolean;
    from: string;
    message: string;
    nonce: string;
    to: string;
    constructor(transaction: any);
}
export declare class AccountError {
    static account_does_not_exist: string;
    static account_fetch_failed: string;
    static transaction_history_fetch_failed: string;
    static transfer_missing_pkey: string;
    static transfer_sender_account_not_found: string;
    static transfer_receiver_account_not_found: string;
}
/**
 * API class provides wrapper for account information.
 */
export declare class AccountApi {
    private _dbApi;
    private _chainApi;
    constructor(dbApi: Database, chainApi: ChainApi);
    /**
       * Gets chain account for given Account name.
       *
       * @param {string} name example: "u123456789abcdef123456789"
       * @return {Promise<Account>}
       */
    getAccountByName(name: string): Promise<Account>;
    /**
       * Gets chain account for given Account id.
       *
       * @param {string} id example: "1.2.345"
       * @return {Promise<Account>}
       */
    getAccountById(id: string): Promise<Account>;
    /**
       * Gets transaction history for given Account name.
       *
       * @param {string} accountName example: "1.2.345"
       * @return {Promise<Transaction[]>}
       */
    getTransactionHistory(accountName: string): Promise<Transaction[]>;
    /**
       * Transfers exact amount of DCT between accounts with optional
       * message for recipient
       *
       * @param {number} amount
       * @param {string} fromAccount Name or id of account
       * @param {string} toAccount Name or id of account
       * @param {string} [memo] Optional memo message for recipient, need to supply pKey to encrypt
       * @param {string} [privateKey] Optional private key, Mandatory if memo is set. Used to encrypt memo
       */
    transfer(amount: number, fromAccount: string, toAccount: string, memo: string, privateKey: string): Promise<any>;
    /**
       * Current account balance of DCT asset on given account
       *
       * @param {string} account Account name or id
       * @return {Promise<number>}
       */
    getBalance(account: string): Promise<number>;
}
