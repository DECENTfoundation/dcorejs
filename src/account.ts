import { Observable } from 'rxjs/Observable'
import { DatabaseApi, DatabaseOperation } from './api/database'
import { ChainApi, ChainMethods } from './api/chain'
import { CryptoUtils } from './crypt'
import {
  Memo,
  TransactionOperationName,
  TransactionOperator,
  TransferOperation
} from './transactionOperator'

export interface Account {
  id: string
  registrar: string
  name: string
  owner: Authority
  active: Authority
  options: Options
  rights_to_publish: PublishRights
  statistics: string
  top_n_control_flags: number
}

export interface PublishRights {
  is_publishing_manager: boolean
  publishing_rights_received: any[]
  publishing_rights_forwarded: any[]
}

export interface Asset {
  amount: number
  asset_id: string
}

export interface Authority {
  weight_threshold: number
  account_auths: any[]
  key_auths: KeyAuth[]
}

export class KeyAuth {
  private _key: string
  private _value: number

  constructor(key: string, value: number = 1) {
    this._key = key
    this._value = value
  }

  public keyAuthFormat(): any[] {
    return [this._key, this._value]
  }
}

export interface Options {
  memo_key: string
  voting_account: string
  num_miner: number
  votes: any[]
  extensions: any[]
  allow_subscription: boolean
  price_per_subscribe: Asset
  subscription_period: number
}

export class Transaction {
  m_from_account_name: Observable<string>
  m_to_account_name: Observable<string>
  m_from_account: string
  m_to_account: string
  m_operation_type: number
  m_transaction_amount: number
  m_transaction_fee: number
  m_str_description: string
  m_timestamp: string
  m_memo: TransactionMemo
  m_memo_string: string

  constructor(transaction: any) {
    this.m_from_account = transaction.m_from_account
    this.m_to_account = transaction.m_to_account
    this.m_operation_type = transaction.m_operation_type
    this.m_transaction_amount = transaction.m_transaction_amount
    this.m_transaction_fee = transaction.m_transaction_fee
    this.m_str_description = transaction.m_str_description
    this.m_timestamp = transaction.m_timestamp
    this.m_memo = new TransactionMemo(transaction)
  }
}

export class TransactionMemo {
  valid: boolean
  from: string
  message: string
  nonce: string
  to: string

  constructor(transaction: any) {
    if (!transaction.m_transaction_encrypted_memo) {
      this.valid = false
    } else {
      this.valid = true
      this.from = transaction.m_transaction_encrypted_memo.from
      this.message = transaction.m_transaction_encrypted_memo.message
      this.nonce = transaction.m_transaction_encrypted_memo.nonce
      this.to = transaction.m_transaction_encrypted_memo.to
    }
  }
}

export class AccountError {
  static account_does_not_exist = 'account_does_not_exist'
  static account_fetch_failed = 'account_fetch_failed'
  static transaction_history_fetch_failed = 'transaction_history_fetch_failed'
  static transfer_missing_pkey = 'transfer_missing_pkey'
  static transfer_sender_account_not_found = 'transfer_sender_account_not_found'
  static transfer_receiver_account_not_found = 'transfer_receiver_account_not_found'
}

/**
 * API class provides wrapper for account information.
 */
export class AccountApi {
  private static asset = 'DCT'
  private _dbApi: DatabaseApi

  constructor(dbApi: DatabaseApi) {
    this._dbApi = dbApi
  }

  /**
     * Gets chain account for given Account name.
     *
     * @param {string} name example: "u123456789abcdef123456789"
     * @return {Promise<Account>}
     */
  public getAccountByName(name: string): Promise<Account> {
    return new Promise((resolve, reject) => {
      this._dbApi
        .execute(DatabaseOperation.getAccountByName, [name])
        .then((account: Account) => {
          resolve(account as Account)
        })
        .catch(err => {
          reject(AccountError.account_fetch_failed)
        })
    })
  }

  /**
     * Gets chain account for given Account id.
     *
     * @param {string} id example: "1.2.345"
     * @return {Promise<Account>}
     */
  public getAccountById(id: string): Promise<Account> {
    return new Promise((resolve, reject) => {
      this._dbApi
        .execute(DatabaseOperation.getAccounts, [[id]])
        .then((accounts: Account[]) => {
          if (accounts.length === 0) {
            reject(AccountError.account_does_not_exist)
          }
          const [account] = accounts
          resolve(account as Account)
        })
        .catch(err => {
          reject(AccountError.account_fetch_failed)
        })
    })
  }

  /**
     * Gets transaction history for given Account name.
     *
     * @param {string} accountName example: "1.2.345"
     * @return {Promise<Transaction[]>}
     */
  public getTransactionHistory(accountName: string): Promise<Transaction[]> {
    return new Promise((resolve, reject) => {
      this.getAccountByName(accountName)
        .then(acc => {
          this._dbApi
            .execute(DatabaseOperation.searchAccountHistory, [
              acc.id,
              '-time',
              '0.0.0',
              100
            ])
            .then(transactions => {
              const res = transactions.map((tr: any) => {
                const transaction = new Transaction(tr)
                // TODO: memo decrypt
                transaction.m_from_account_name = new Observable(observable => {
                  this.getAccountById(transaction.m_from_account)
                    .then(account => observable.next(account.name))
                    .catch(err => observable.next(''))
                })
                transaction.m_to_account_name = new Observable(observable => {
                  this.getAccountById(transaction.m_to_account)
                    .then(account => observable.next(account.name))
                    .catch(err => observable.next(''))
                })
                return transaction
              })
              resolve(res)
            })
            .catch(err => {
              reject(AccountError.transaction_history_fetch_failed)
            })
        })
        .catch(err => {
          reject(AccountError.transaction_history_fetch_failed)
        })
    })
  }

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
  public transfer(
    amount: number,
    fromAccount: string,
    toAccount: string,
    memo: string,
    privateKey: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      if (memo && !privateKey) {
        reject(AccountError.transfer_missing_pkey)
      }
      const operations = new ChainMethods()
      operations.add(ChainMethods.getAccount, fromAccount)
      operations.add(ChainMethods.getAccount, toAccount)
      operations.add(ChainMethods.getAsset, AccountApi.asset)

      ChainApi.fetch(operations).then(result => {
        const [senderAccount, receiverAccount, asset] = result
        if (!senderAccount) {
          reject(AccountError.transfer_sender_account_not_found)
        }
        if (!receiverAccount) {
          reject(AccountError.transfer_receiver_account_not_found)
        }

        const nonce: string = ChainApi.generateNonce()
        const fromPublicKey = senderAccount
          .get('owner')
          .get('key_auths')
          .get(0)
          .get(0)
        const toPublicKey = receiverAccount
          .get('owner')
          .get('key_auths')
          .get(0)
          .get(0)

        const memo_object: Memo = {
          from: fromPublicKey,
          to: toPublicKey,
          nonce: nonce,
          message: CryptoUtils.encryptWithChecksum(
            memo,
            privateKey,
            toPublicKey,
            nonce
          )
        }

        const tr = TransactionOperator.createTransactionBuilder()
        const transfer: TransferOperation = {
          from: senderAccount.get('id'),
          to: receiverAccount.get('id'),
          amount: TransactionOperator.createAsset(amount, asset.get('id')),
          memo: memo_object
        }

        console.log(transfer)
        TransactionOperator.addOperation(
          { name: TransactionOperationName.transfer, data: transfer },
          tr
        )
        TransactionOperator.broadcastTransaction(tr, privateKey, fromPublicKey)
          .then(() => {
            resolve()
          })
          .catch(() => {
            reject()
          })
      })
    })
  }
}
