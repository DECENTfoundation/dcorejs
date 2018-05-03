import {dcorejs_lib} from './helpers';
import {KeyPrivate, KeyPublic, Utils} from './utils';

import {Key, KeyParts} from './content';
import {Authority, Options} from './account';
import {AssetOptions, MonitoredAssetOptions} from './assetModule';
import {Block} from './explorer';

/**
 * OperationType to be broadcasted to blockchain
 * internal representation
 */
export class Operation {
    name: OperationName;
    operation: object;

    constructor(name: OperationName, type: object) {
        this.name = name;
        this.operation = type;
    }
}

/**
 * Class contains available transaction operation names constants
 */
export enum OperationName {
    transfer = 'transfer',
    content_cancellation = 'content_cancellation',
    requestToBuy = 'request_to_buy',
    content_submit = 'content_submit',
    account_update = 'account_update',
    asset_create = 'asset_create',
    issue_asset = 'issue_asset',
    update_monitored_asset_operation = 'update_monitored_asset_operation',
    asset_fund_pools_operation = 'asset_fund_pools_operation',
    asset_reserve_operation = 'asset_reserve_operation',
    asset_claim_fees_operation = 'asset_claim_fees_operation',
}

/**
 * Asset represent amount of specific
 * asset.
 */
export class Asset {
    amount: number;
    asset_id: string;
}

/**
 * Memo message object representation
 */
export interface Memo {
    from: string;
    to: string;
    nonce: string;
    message: Buffer;
}

/**
 * Operations collection which can be constructed and send to blockchain network
 */
export namespace Operations {
    import AssetExchangeRate = Block.AssetExchangeRate;

    export class TransferOperation extends Operation {
        constructor(from: string, to: string, amount: Asset, memo: Memo) {
            super(
                OperationName.transfer,
                {
                    from,
                    to,
                    amount,
                    memo
                });
        }
    }

    export class ContentCancelOperation extends Operation {
        constructor(author: string, URI: string) {
            super(
                OperationName.content_cancellation,
                {
                    author,
                    URI
                });
        }
    }

    export class BuyContentOperation extends Operation {
        constructor(
            URI: string,
            consumer: string,
            price: Asset,
            region_code_from: number,
            pubKey: Key
        ) {
            super(
                OperationName.requestToBuy,
                {
                    URI,
                    consumer,
                    price,
                    region_code_from,
                    pubKey
                }
            );
        }
    }

    export class SubmitContentOperation extends Operation {
        constructor(
            size: number,
            author: string,
            co_authors: any[],
            URI: string,
            quorum: number,
            price: RegionalPrice[],
            hash: string,
            seeders: string[],
            key_parts: KeyParts[],
            expiration: string,
            publishing_fee: Asset,
            synopsis: string
        ) {
            super(
                OperationName.content_submit,
                {
                    size,
                    author,
                    co_authors,
                    URI,
                    quorum,
                    price,
                    hash,
                    seeders,
                    key_parts,
                    expiration,
                    publishing_fee,
                    synopsis,
                });
        }
    }

    export class AccountUpdateOperation extends Operation {
        constructor(account: string,
                    owner: Authority,
                    active: Authority,
                    new_options: Options,
                    extensions: {}
        ) {
            super(
                OperationName.account_update,
                {
                    account,
                    owner,
                    active,
                    new_options,
                    extensions
                }
            );
        }
    }

    export class AssetCreateOperation extends Operation {
        constructor(issuer: string,
                    symbol: string,
                    precision: number,
                    description: string,
                    options: AssetOptions,
                    monitoredOptions: MonitoredAssetOptions = null) {
            const data = {
                issuer,
                symbol,
                precision,
                description,
                options,
                extensions: {}
            };
            if (monitoredOptions) {
                data['monitored_asset_opts'] = monitoredOptions;
            }
            super(OperationName.asset_create, data);
        }
    }

    export class IssueAssetOperation extends Operation {
        constructor(issuer: string, assetToIssue: Asset, issueToAccount: string, memo: string) {
            super(OperationName.issue_asset, {
                issuer,
                asset_to_issue: assetToIssue,
                issue_to_account: issueToAccount,
                memo,
                extensions: {}
            });
        }
    }

    export class UpdateAssetIssuedOperation extends Operation {
        constructor(issuer: string,
                    asset_to_update: string,
                    new_description: string,
                    max_supply: number,
                    core_exchange_rate: AssetExchangeRate,
                    is_exchangeable: boolean,
                    new_issuer?: string) {
            super(
                OperationName.update_monitored_asset_operation,
                {
                    issuer,
                    asset_to_update,
                    new_description,
                    max_supply,
                    core_exchange_rate,
                    is_exchangeable,
                    new_issuer,
                    extensions: {}
                }
            );
        }
    }

    export class AssetFundPools extends Operation {
        constructor(fromAccountId: string, uiaAsset: Asset, dctAsset: Asset) {
            super(
                OperationName.asset_fund_pools_operation,
                {
                    from_account: fromAccountId,
                    uia_asset: uiaAsset,
                    dct_asset: dctAsset,
                    extensions: {}
                }
            );
        }
    }

    export class AssetReserve extends Operation {
        constructor(payer: string, assetToReserve: Asset) {
            super(
                OperationName.asset_reserve_operation,
                {
                    payer,
                    amount_to_reserve: assetToReserve,
                    extensions: {}
                }
            );
        }
    }

    export class AssetClaimFeesOperation extends Operation {
        constructor(issuer: string, uiaAsset: Asset, dctAsset: Asset) {
            super(
                OperationName.asset_claim_fees_operation,
                {
                    issuer,
                    uia_asset: uiaAsset,
                    dct_asset: dctAsset,
                    extensions: {}
                }
            );
        }
    }
}

export interface RegionalPrice {
    region: number;
    price: Asset;
}

export class Transaction {
    /**
     * dcore_jsjs.lib/lib - TransactionBuilder
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

    /**
     * Append new operation to transaction object.
     *
     * @param {Operation} operation
     * @return {boolean}
     */
    public add(operation: Operation): boolean {
        this._transaction.add_type_operation(operation.name, operation.operation);
        this._operations.push(operation);
        return true;
    }

    /**
     * Broadcast transaction to dcore_js blockchain.
     *
     * @param {string} privateKey
     * @return {Promise<void>}
     */
    public broadcast(privateKey: string): Promise<void> {
        const secret = Utils.privateKeyFromWif(privateKey);
        const pubKey = Utils.getPublicKey(secret);
        return new Promise((resolve, reject) => {
            this.setTransactionFees()
                .then(() => {
                    this.signTransaction(secret, pubKey);
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
     * @param transaction TransactionBuilder instance
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
    private signTransaction(privateKey: KeyPrivate, publicKey: KeyPublic): void {
        this._transaction.add_signer(privateKey.key, publicKey.key);
    }
}
