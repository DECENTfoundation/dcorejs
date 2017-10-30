const {TransactionBuilder, ops} = require('decentjs-lib/lib');

/**
 * Operation to be broadcasted to blockchain
 * internal representation
 */
export interface TransactionOperation {
    name: string
    data: Transaction
}

/**
 * Class contains available transaction operation names constants
 */
export class TransactionOperationName {
    static transfer = 'transfer';
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
export interface Transaction {
}

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

/**
 * Provides methods to manipulate and broadcast transactions to
 * network.
 */
export class TransactionOperator {
    static DCTPower = Math.pow(10, 8);

    public static createTransactionBuilder(): any {
        return new TransactionBuilder();
    }

    public static createAsset(amount: number, assetId: string): Asset {
        return {
            amount: Math.floor(amount * TransactionOperator.DCTPower),
            asset_id: assetId
        };
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
    public static addOperation(operation: TransactionOperation,
                               transaction: any): boolean {
        if (!ops.hasOwnProperty(operation.name)) {
            return false;
        }
        ops[operation.name].keys.forEach((key: string) => {
            if (!operation.data.hasOwnProperty(key)) {
                return false;
            }
        });
        transaction.add_type_operation(operation.name, operation.data);
        return true;
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
    public static broadcastTransaction(transaction: any,
                                       privateKey: string,
                                       publicKey: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this.setTransactionFees(transaction)
                .then(() => {
                    transaction.add_signer(privateKey, publicKey);
                    transaction.broadcast(() => {
                        resolve();
                    });
                })
                .catch(() => {
                    reject();
                });
        });
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
                    resolve();
                })
                .catch(() => {
                    // TODO: error handling
                    reject();
                });
        });
    }
}
