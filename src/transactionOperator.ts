import { Synopsis } from './content'

const { TransactionBuilder, ops } = require('decentjs-lib/lib')

/**
 * Operation to be broadcasted to blockchain
 * internal representation
 */
export interface TransactionOperation {
  name: string
  operation: Transaction
}

/**
 * Class contains available transaction operation names constants
 */
export class TransactionOperationName {
  static transfer = 'transfer'
  static content_cancellation = 'content_cancellation'
  static requestToBuy = 'request_to_buy'
  static content_submit = 'content_submit'
}

/**
 * Asset represent amount of specific
 * asset.
 */
export interface Asset {
  amount: number
  asset_id: string
}

/**
 * Memo message object representation
 */
export interface Memo {
  from: string
  to: string
  nonce: string
  message: Buffer
}

/**
 * Transaction operations generalization
 */
export interface Transaction {}

/**
 * Transfer operation between two accounts
 * represented by from/to string ids
 *
 * !Important: asset need to be calculated to specific asset
 */
export interface TransferOperation extends Transaction {
  from: string
  to: string
  amount: Asset
  memo: Memo
}

export interface ContentCancelOperation extends Transaction {
  author: string
  URI: string
}

export interface BuyContentOperation extends Transaction {
  URI: string
  consumer: string
  price: Asset
  region_code_from: number
  pubKey: Key
}

export interface SubmitContentOperation extends Transaction {
  size: number
  author: string
  co_authors: any[]
  URI: string
  quorum: number
  price: RegionalPrice[]
  hash: string
  seeders: string[]
  key_parts: KeyParts[]
  expiration: string
  publishing_fee: Asset
  synopsis: string
}

// userRights: content.userRights,

export interface Key {
  s: string
}

export interface KeyParts {
  C1: Key
  D1: Key
}

export interface RegionalPrice {
  region: number
  price: Asset
}

/**
 * // TODO: Create wrapper class for TransactionBuilder for stronger typing
 * Provides methods to manipulate and broadcast transactions to
 * network.
 */
export class TransactionOperator {
  static DCTPower = Math.pow(10, 8)

  public static createTransaction(): any {
    return new TransactionBuilder()
  }

  public static createAsset(amount: number, assetId: string): Asset {
    return {
      amount: Math.floor(amount * TransactionOperator.DCTPower),
      asset_id: assetId
    }
  }

  /**
     * Add requested operation to transaction object.
     *
     * If operation does not exist or data property of
     * operation object does not match required properties
     * false is returned.
     *
     * @param {TransactionOperation} operation
     * @param transaction TransactionBuilder instance
     * @return {boolean}
     */
  public static addOperation(
    operation: TransactionOperation,
    transaction: any
  ): boolean {
    if (!ops.hasOwnProperty(operation.name)) {
      return false
    }
    ops[operation.name].keys.forEach((key: string) => {
      if (!operation.operation.hasOwnProperty(key)) {
        return false
      }
    })
    transaction.add_type_operation(operation.name, operation.operation)
    return true
  }

  /**
     * broadcastTransaction will set required fees for operation,
     * sign operation with public/private keys and broadcast is
     * to blockchain
     *
     * @param transaction TransactionBuilder instance with requested operations
     * @param {string} privateKey
     * @param {string} publicKey
     * @return {Promise<any>}
     */
  public static broadcastTransaction(
    transaction: any,
    privateKey: string,
    publicKey: string
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this.setTransactionFees(transaction)
        .then(() => {
          transaction.add_signer(privateKey, publicKey)
          transaction
            .broadcast()
            .then(() => {
              resolve()
            })
            .catch((err: any) => {
              reject(err)
            })
        })
        .catch(err => {
          reject(err)
        })
    })
  }

  /**
     * Set transaction fee required for transaction operation
     * @param transaction TransactionBuilder instance
     * @return {Promise<any>}
     */
  private static setTransactionFees(transaction: any): Promise<any> {
    return new Promise((resolve, reject) => {
      transaction
        .set_required_fees()
        .then(() => {
          resolve()
        })
        .catch(() => {
          // TODO: error handling
          reject()
        })
    })
  }
}
