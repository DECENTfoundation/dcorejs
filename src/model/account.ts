/**
 * @module Model/Account
 */
import { Utils } from '../utils';
import { CryptoUtils } from '../crypt';
import { ChainApi } from '../api/chain';
import { DCoreAssetObject } from './asset';

export type AccountNameIdPair = [string, string];

export interface IHistoryOptions {
    fromId?: string
    resultLimit?: number
}

export class HistoryOptions implements IHistoryOptions {
    fromId? = null;
    resultLimit? = null;
}

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

export interface DCoreAccount {
    proposals: string[];
    statistics: string;
    vesting_balances: any[];
    orders: any[];
    active: Authority;
    call_orders: any[];
    top_n_control_flags: number;
    name: string;
    registrar: string;
    rights_to_publish: PublishRights;
    owner: Authority;
    balances: Balances;
    id: string;
    registrar_name: string;
    options: Options;
}

export interface Balances {
    [key: string]: string;
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

    public static createDCTAsset(amount: number): Asset {
        return {
            amount: amount * ChainApi.DCTPower,
            asset_id: ChainApi.asset_id
        };
    }

    public static create(amount: number, assetObject: DCoreAssetObject): Asset {
        return new Asset(
            Utils.formatAmountToAsset(amount, assetObject),
            assetObject.id
        );
    }

    constructor(amount: number, assetId: string) {
        this.asset_id = assetId;
        this.amount = amount;
    }
}

export interface Authority {
    weight_threshold: number;
    account_auths: any[];
    key_auths: [string, number][];
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

export enum OperationType {
    transfer,
    account_create,
    content_submit,
    content_buy,
    content_rate,
    subscription
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
    id: string;
    fromAccountName: string;
    toAccountName: string;
    fromAccountId: string;
    toAccountId: string;
    operationType: OperationType;
    transactionAmount: number;
    transactionAsset: string;
    transactionFee: number;
    transactionFeeAsset: string;
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
        this.transactionAsset = transaction.m_transaction_amount.asset_id;
        this.transactionFee = transaction.m_transaction_fee.amount;
        this.transactionFeeAsset = transaction.m_transaction_fee.asset_id;
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
        let decrypted = '';

        privateKeys.forEach(pk => {
            try {
                decrypted = CryptoUtils.decryptWithChecksum(this.message, pk, this.to, this.nonce).toString();
            } catch (err) {
                throw new Error(AccountError.account_keys_incorrect);
            }
        });
        return decrypted;
    }
}

export interface HistoryRecord {
    id: string
    op: [number, any]
    result: any[]
    block_num: number
    trx_in_block: number
    op_in_trx: number
    virtual_op: number
}

export class HistoryBalanceObject {
    hist_object: HistoryRecord;
    balance: {
        asset0: Asset;
        asset1: Asset
    };
    fee: Asset;
}

export interface MinerInfo {
    id: string;
    name: string;
    url: string;
    total_votes: number;
    voted: boolean;
}

export interface WalletExport {
    version: number;
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

export interface SubscriptionParameters {
    allowSubscription: boolean;
    pricePerSubscribeAmount: number;
    subscriptionPeriod: number;
}

export interface IUpdateAccountParameters {
    newOwnerKey?: string;
    newActiveKey?: string;
    newMemoKey?: string;
    newNumMiner?: number;
    newVotes?: Array<string>;
    newSubscription?: SubscriptionParameters;
}

export class UpdateAccountParameters implements IUpdateAccountParameters {
    newOwnerKey?: string = null;
    newActiveKey?: string = null;
    newMemoKey?: string = null;
    newNumMiner?: number = null;
    newVotes?: Array<string> = null;
    newSubscription?: SubscriptionParameters = null;
}

export enum AccountError {
    account_does_not_exist = 'account_does_not_exist',
    account_fetch_failed = 'account_fetch_failed',
    api_connection_failed = 'api_connection_failed',
    transaction_history_fetch_failed = 'transaction_history_fetch_failed',
    transfer_missing_pkey = 'transfer_missing_pkey',
    transfer_sender_account_not_found = 'transfer_sender_account_not_found',
    transfer_receiver_account_not_found = 'transfer_receiver_account_not_found',
    database_operation_failed = 'database_operation_failed',
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    account_keys_incorrect = 'account_keys_incorrect',
    bad_parameter = 'bad_parameter',
    history_fetch_failed = 'history_fetch_failed',
    cannot_update_miner_votes = 'cannot_update_miner_votes',
    votes_does_not_changed = 'votes_does_not_changed',
    asset_does_not_exist = 'asset_does_not_exist',
    account_update_failed = 'account_update_failed',
    syntactic_error = 'syntactic_error',
    invalid_parameters = 'invalid_parameters',
}
