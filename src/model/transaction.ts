import {AssetOptions} from './asset';
import {Key, KeyParts} from './content';
import {Block} from './explorer';
import AssetExchangeRate = Block.AssetExchangeRate;
import {Authority, Options} from './account';
import {MonitoredAssetOptions} from './asset';

/**
 * OperationType to be broadcasted to blockchain
 * internal representation
 */
export class Operation {
    name: OperationName;
    operation: object;

    constructor(name: OperationName, type?: object) {
        this.name = name;
        this.operation = type;
    }
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
 * Class contains available transaction operation names constants
 */
export enum OperationName {
    transfer = 'transfer',
    content_cancellation = 'content_cancellation',
    requestToBuy = 'request_to_buy',
    content_submit = 'content_submit',
    account_update = 'account_update',
    asset_create = 'asset_create',
    issue_asset = 'asset_issue',
    update_user_issued_asset = 'update_user_issued_asset',
    asset_fund_pools_operation = 'asset_fund_pools_operation',
    asset_reserve_operation = 'asset_reserve_operation',
    asset_claim_fees_operation = 'asset_claim_fees_operation',
    leave_rating_and_comment = 'leave_rating_and_comment',
    account_create = 'account_create',
    asset_publish_feed = 'asset_publish_feed',
    miner_create = 'miner_create',
    miner_update = 'miner_update',
    proposal_create = 'proposal_create',
    operation_wrapper = 'op_wrapper',
    vesting_balance_withdraw = 'vesting_balance_withdraw',
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
 * Operations collection which can be constructed and send to blockchain network
 */
export namespace Operations {
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
                is_exchangeable: options.is_exchangeable,
                extensions: []
            };
            if (monitoredOptions) {
                data['monitored_asset_opts'] = monitoredOptions;
            }
            super(OperationName.asset_create, data);
        }
    }

    export class IssueAssetOperation extends Operation {
        constructor(issuer: string, assetToIssue: Asset, issueToAccount: string, memo?: Memo) {
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
                OperationName.update_user_issued_asset,
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
                    dct_asset: dctAsset
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

    export class LeaveRatingAndComment extends Operation {
        constructor(URI: string, consumer: string, comment: string, rating: number) {
            super(
                OperationName.leave_rating_and_comment,
                {
                    URI,
                    consumer,
                    comment,
                    rating
                }
            );
        }
    }

    export class AssetPublishFeed extends Operation {
        constructor(publisher: string, assetId: string, feed: PriceFeed) {
            super(
                OperationName.asset_publish_feed,
                {
                    publisher,
                    asset_id: assetId,
                    feed,
                    extensions: {}
                }
            );
        }
    }

    export class MinerCreate extends Operation {
        constructor(miner_account: string, url: string, block_signing_key: string) {
            super(
                OperationName.miner_create,
                {
                    miner_account,
                    url,
                    block_signing_key
                }
            );
        }
    }

    export class MinerUpdate extends Operation {
        constructor(miner: string, minerAccount: string, newURL: string = null, newSigningKey: string = null) {
            super(
                OperationName.miner_update,
                {
                    miner,
                    miner_account: minerAccount,
                    new_url: newURL,
                    new_signing_key: newSigningKey
                }
            );
        }
    }

    export class ProposalCreate extends Operation {
        constructor(feePayingAccount: string,
                    proposedOperations: object[],
                    expirationTime: number,
                    reviewPeriodSeconds: number = null) {
            super(
                OperationName.proposal_create,
                {
                    fee_paying_account: feePayingAccount,
                    proposed_ops: proposedOperations,
                    expiration_time: expirationTime,
                    review_period_seconds: reviewPeriodSeconds,
                    extensions: []
                }
            );
        }
    }

    export class OperationWrapper extends Operation {
        constructor(operation: Operation) {
            super(
                OperationName.operation_wrapper,
                {
                    op: operation
                }
            );
        }
    }

    export interface CreateAccountParameters {
        fee?: Asset,
        name?: string,
        owner?: Authority,
        active?: Authority,
        options?: Options,
        registrar?: string,
        extensions?: any
    }

    export class RegisterAccount extends Operation {
        constructor(params: CreateAccountParameters) {
            super(OperationName.account_create, params);
        }
    }

    export class VestingBalanceWithdraw extends Operation {
        constructor(vestingBalanceId: string, ownerId: string, ammount: Asset) {
            super(
                OperationName.vesting_balance_withdraw,
                {
                    vesting_balance: vestingBalanceId,
                    owner: ownerId,
                    amount: ammount
                });
        }
    }
}

export interface RegionalPrice {
    region: number;
    price: Asset;
}

export interface PriceFeed {
    core_exchange_rate: AssetExchangeRate
}

export interface ContentObject {
    author: string;
    co_authors: [string, number];
    expiration: number;
    created: number;
    price: RegionalPrice;
    synopsis: string;
    size: number;
    quorum: number;
    URI: string;
    key_parts: [string, string];
    last_proof: [string, number];
    seeder_price: [string, any];
    is_blocked: boolean;
    ripemd160
    _hash: string;
    AVG_rating: number;
    num_of_ratings: number;
    times_bought: number;
    publishing_fee_escrow: Asset;
    cd: any;
}
