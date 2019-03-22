/**
 * @module Model/OperationPrototype
 */
import {Asset, Memo, PriceFeed, RegionalPrice} from './transaction';
import {Key, KeyParts} from './content';
import {Authority, Options} from './account';
import {AssetOptions, MonitoredAssetOptions} from './asset';
import {Block} from './explorer';
import AssetExchangeRate = Block.AssetExchangeRate;

export abstract class OperationType {}

export interface TransferType extends OperationType {
    fee?: Asset,
    from: string;
    to: string;
    amount: Asset;
    memo: Memo;
    extensions?: any;
}

export class TransferPrototype {
    static getPrototype(): TransferType {
        return {
            from: '1.2.X',
            to: '1.2.X',
            amount: {amount: 10, asset_id: '1.3.0'},
            memo: {from: '', to: '', nonce: '', message: ''},
        };
    }
}

export interface ContentCancellationType extends OperationType {
    author: string,
    URI: string,
}

export class ContentCancelPrototype {
    static getPrototype(): ContentCancellationType {
        return {
            author: '1.2.X',
            URI: '',
        };
    }
}

export interface BuyContentType extends OperationType {
    URI: string,
    consumer: string,
    price: Asset,
    region_code_from: number,
    pubKey: Key
}

export class BuyContentPrototype {
    static getPrototype(): BuyContentType {
        return {
            URI: '',
            consumer: '1.2.X',
            price: {
                amount: 0,
                asset_id: '1.3.0',
            },
            region_code_from: 0,
            pubKey: {
                s: '',
            },
        };
    }
}

export interface SubmitContentType extends OperationType {
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
}

export class SubmitContentPrototype {
    static getPrototype(): SubmitContentType {
        return {
            size: 1024,
            author: '1.2.X',
            co_authors: ['1.2.X', '1.2.X'],
            URI: '',
            quorum: 0,
            price: [{
                region: 0,
                price: {
                    amount: 10,
                    asset_id: '1.3.0'
                }
            }],
            hash: '',
            seeders: ['1.2.X', '1.2.X'],
            key_parts: [
                {C1: {s: ''}, D1: {s: ''}},
            ],
            expiration: '2018-07-04T16:00:00',
            publishing_fee: {
                amount: 0,
                asset_id: '1.3.0',
            },
            synopsis: ''
        };
    }
}

export interface UpdateAccountType extends OperationType {
    account: string,
    owner: Authority,
    active: Authority,
    new_options: Options,
    extensions: object
}

export class UpdateAccountPrototype {
    static getPrototype(): UpdateAccountType {
        return {
            account: '1.2.X',
            owner: {
                weight_threshold: 0,
                account_auths: [],
                key_auths: [['', 0], ['', 1]],
            },
            active: {
                weight_threshold: 0,
                account_auths: [],
                key_auths: [['', 0], ['', 1]],
            },
            new_options: {
                memo_key: '',
                voting_account: '',
                num_miner: 0,
                votes: ['', ''],
                extensions: [],
                allow_subscription: true,
                price_per_subscribe: {
                    amount: 0,
                    asset_id: '1.3.0',
                },
                subscription_period: 0,
            },
            extensions: [],
        };
    }
}

export interface AssetCreateType extends OperationType {
    issuer: string,
    symbol: string,
    precision: number,
    description: string,
    options: AssetOptions,
    is_exchangeable: boolean,
    extensions: Array<any>,
    monitored_asset_opts?: MonitoredAssetOptions,
}

export class AssetCreatePrototype {
    static getPrototype(): AssetCreateType {
        return {
            issuer: '1.2.X',
            symbol: '',
            precision: 0,
            description: '',
            options: {
                max_supply: 0,
                core_exchange_rate: {
                    base: {
                        amount: 0,
                        asset_id: '1.3.0',
                    },
                    quote: {
                        amount: 0,
                        asset_id: '1.3.0',
                    },
                },
                is_exchangeable: false,
                extensions: [],
            },
            is_exchangeable: false,
            extensions: [],
            monitored_asset_opts: {
                feeds: [],
                current_feed: {
                    core_exchange_rate: {
                        base: {
                            amount: 0,
                            asset_id: '1.3.0',
                        },
                        quote: {
                            amount: 0,
                            asset_id: '1.3.0',
                        },
                    },
                },
                current_feed_publication_time: 0,
                feed_lifetime_sec: 0,
                minimum_feeds: 0,
            },
        };
    }
}

export interface IssueAssetType extends OperationType {
    issuer: string;
    asset_to_issue: Asset;
    issue_to_account: string;
    memo?: Memo;
    extensions: object;
}

export class IssueAssetPrototype {
    static getPrototype(): IssueAssetType {
        return {
            issuer: '1.2.X',
            asset_to_issue: {
                amount: 0,
                asset_id: '1.3.0',
            },
            issue_to_account: '1.2.X',
            memo: {
                from: '',
                to: '',
                nonce: '',
                message: '',
            },
            extensions: {}
        };
    }
}

export interface UpdateIssuedAssetType extends OperationType {
    issuer: string,
    asset_to_update: string,
    new_description: string,
    max_supply: number,
    core_exchange_rate: AssetExchangeRate,
    is_exchangeable: boolean,
    new_issuer?: string,
    extensions: object;
}

export class UpdateUserIssuedAssetPrototype {
    static getPrototype(): UpdateIssuedAssetType {
        return {
            issuer: '1.2.X',
            asset_to_update: '1.3.X',
            new_description: '',
            max_supply: 0,
            core_exchange_rate: {
                base: {
                    amount: 0,
                    asset_id: '1.3.0',
                },
                quote: {
                    amount: 0,
                    asset_id: '1.3.0',
                },
            },
            is_exchangeable: true,
            new_issuer: '1.2.X',
            extensions: {},
        };
    }
}

export interface AssetFundPoolsType extends OperationType {
    from_account: string,
    uia_asset: Asset,
    dct_asset: Asset
}

export class AssetFundPoolsPrototype {
    static getPrototype(): AssetFundPoolsType {
        return {
            from_account: '1.2.X',
            uia_asset: {
                amount: 0,
                asset_id: '1.3.0',
            },
            dct_asset: {
                amount: 0,
                asset_id: '1.3.0',
            }
        };
    }
}

export interface AssetReserveType extends OperationType {
    payer: string,
    amount_to_reserve: Asset,
    extensions: object
}

export class AssetReservePrototype {
    static getPrototype(): AssetReserveType {
        return {
            payer: '1.2.X',
            amount_to_reserve: {
                amount: 0,
                asset_id: '1.3.0',
            },
            extensions: {}
        };
    }
}

export interface AssetClaimFeesType extends OperationType {
    issuer: string,
    uia_asset: Asset,
    dct_asset: Asset,
    extensions: object
}

export class AssetClaimFeesPrototype {
    static getPrototype(): AssetClaimFeesType {
        return {
            issuer: '1.2.X',
            uia_asset: {
                amount: 0,
                asset_id: '1.3.0',
            },
            dct_asset: {
                amount: 0,
                asset_id: '1.3.0',
            },
            extensions: {}
        };
    }
}

export interface LeaveRatingAndCommentType extends OperationType {
    URI: string;
    consumer: string;
    comment: string;
    rating: number;
}

export class LeaveRatingAndCommentPrototype {
    static getPrototype(): LeaveRatingAndCommentType {
        return {
            URI: '',
            consumer: '1.2.X',
            comment: '',
            rating: 0,
        };
    }
}

export interface AssetPublishFeedType extends OperationType {
    publisher: string,
    asset_id: string,
    feed: PriceFeed;
    extensions: object;
}

export class AssetPublishFeedPrototype {
    static getPrototype(): AssetPublishFeedType {
        return {
            publisher: '1.2.X',
            asset_id: '1.3.X',
            feed: {
                core_exchange_rate: {
                    base: {
                        amount: 0,
                        asset_id: '1.3.0',
                    },
                    quote: {
                        amount: 0,
                        asset_id: '1.3.0',
                    },
                }
            },
            extensions: {}
        };
    }
}

export interface MinerCreateType extends OperationType {
    miner_account: string;
    url: string;
    block_signing_key: string;
}

export class MinerCreatePrototype {
    static getPrototype(): MinerCreateType {
        return {
            miner_account: '1.2.X',
            url: '',
            block_signing_key: '',
        };
    }
}

export interface MinerUpdateType extends OperationType {
    miner: string;
    miner_account: string;
    new_url: string;
    new_signing_key: string;
}

export class MinerUpdatePrototype {
    static getPrototype(): MinerUpdateType {
        return {
            miner: '1.2.X',
            miner_account: '',
            new_url: '',
            new_signing_key: '',
        };
    }
}

export interface MinerUpdateGlobalParametersType extends OperationType {
    new_parameters: {
        current_fees?: {
            parameters: Array<[number, object]>;
            scale: number;
        };
        block_interval?: number;
        maintenance_interval?: number;
        maintenance_skip_slots?: number;
        miner_proposal_review_period?: number;
        maximum_transaction_size?: number;
        maximum_block_size?: number;
        maximum_time_until_expiration?: number;
        maximum_proposal_lifetime?: number;
        maximum_asset_feed_publishers?: number;
        maximum_miner_count?: number;
        maximum_authority_membership?: number;
        cashback_vesting_period_seconds?: number;
        cashback_vesting_threshold?: number;
        max_predicate_opcode?: number;
        max_authority_depth?: number;
        extensions?: Array<any>;
    }
}

export class MinerUpdateGlobalParametersPrototype {
    static getPrototype(): MinerUpdateGlobalParametersType {
        return {
            new_parameters: {
                current_fees: {
                    parameters: [[0, {}]],
                    scale: 0,
                },
                block_interval: 0,
                maintenance_interval: 0,
                maintenance_skip_slots: 0,
                miner_proposal_review_period: 0,
                maximum_transaction_size: 0,
                maximum_block_size: 0,
                maximum_time_until_expiration: 0,
                maximum_proposal_lifetime: 0,
                maximum_asset_feed_publishers: 0,
                maximum_miner_count: 0,
                maximum_authority_membership: 0,
                cashback_vesting_period_seconds: 0,
                cashback_vesting_threshold: 0,
                max_predicate_opcode: 0,
                max_authority_depth: 0,
                extensions: [],
            }
        };
    }
}

export interface ProposalCreateType extends OperationType {
    fee_paying_account: string,
    proposed_ops: OperationType[],
    expiration_time: string,
    review_period_seconds: number,
    extensions: Array<any>;
}

export class ProposalCreatePrototype {
    static getPrototype(): ProposalCreateType {
        return {
            fee_paying_account: '1.2.X',
            proposed_ops: [{}],
            expiration_time: '2018-07-04T16:00:00',
            review_period_seconds: 0,
            extensions: []
        };
    }
}

export interface ProposalUpdateType extends OperationType {
    fee_paying_account: string,
    proposal: string,
    active_approvals_to_add: Array<string>,
    active_approvals_to_remove: Array<string>,
    owner_approvals_to_add: Array<string>,
    owner_approvals_to_remove: Array<string>,
    key_approvals_to_add: Array<string>,
    key_approvals_to_remove: Array<string>,
    extensions: Array<any>,
}

export class ProposalUpdatePrototype {
    static getPrototype(): ProposalUpdateType {
        return {
            fee_paying_account: '1.2.X',
            proposal: '1.6.X',
            active_approvals_to_add: ['', ''],
            active_approvals_to_remove: ['', ''],
            owner_approvals_to_add: ['', ''],
            owner_approvals_to_remove: ['', ''],
            key_approvals_to_add: ['', ''],
            key_approvals_to_remove: ['', ''],
            extensions: []
        };
    }
}

export interface OperationWrapperType extends OperationType {
    op: object
}

export class OperationWrapperPrototype {
    static getPrototype(): OperationWrapperType {
        return {
            op: {},
        };
    }
}

export interface CreateAccountType extends OperationType {
    fee: Asset,
    name: string,
    owner: Authority,
    active: Authority,
    options: Options,
    registrar: string,
    extensions: any
}

export class CreateAccountPrototype {
    static getPrototype(): CreateAccountType {
        return {
            fee: {
                amount: 0,
                asset_id: '1.3.0'
            },
            name: '',
            owner: {
                weight_threshold: 0,
                account_auths: [],
                key_auths: [['', 0]],
            },
            active: {
                weight_threshold: 0,
                account_auths: [],
                key_auths: [['', 0]],
            },
            options: {
                memo_key: '',
                voting_account: '',
                num_miner: 0,
                votes: [],
                extensions: [],
                allow_subscription: true,
                price_per_subscribe: {
                    amount: 0,
                    asset_id: '1.3.0',
                },
                subscription_period: 0,
            },
            registrar: '',
            extensions: [],
        };
    }
}

export interface VestingBalanceWithdrawType extends OperationType {
    vesting_balance: string,
    owner: string,
    amount: Asset
}

export class VestingBalanceWithdrawPrototype {
    static getPrototype(): VestingBalanceWithdrawType {
        return {
            vesting_balance: '',
            owner: '1.2.X',
            amount: {
                amount: 0,
                asset_id: '1.3.0',
            }
        };
    }
}

export interface UpdateMonitoredAssetType extends OperationType {
    issuer: string,
    asset_to_update: string,
    new_description: string,
    new_feed_lifetime_sec: number,
    new_minimum_feeds: number,
}

export class UpdateMonitoredAssetPrototype {
    static getPrototype(): UpdateMonitoredAssetType {
        return {
            issuer: '1.2.X',
            asset_to_update: '1.3.X',
            new_description: '',
            new_feed_lifetime_sec: 0,
            new_minimum_feeds: 1,
        };
    }
}

export interface SubscribeType extends OperationType {
    from: string,
    to: string,
    price: Asset
}

export class SubscribePrototype {
    static getPrototype(): SubscribeType {
        return {
            from: '1.2.X',
            to: '1.2.X',
            price: {
                amount: 0,
                asset_id: '1.3.0'
            }
        };
    }
}

export interface SubscribeByAuthorType extends OperationType {
    from: string,
    to: string,
}

export class SubscribeByAuthorPrototype {
    static getPrototype(): SubscribeByAuthorType {
        return {
            from: '1.2.X',
            to: '1.2.X',
        };
    }
}

export interface AutomaticRenewalOfSubscriptionType extends OperationType {
    consumer: string,
    subscription: string,
    automatic_renewal: boolean
}

export class SetAutomaticRenewalOfSubscriptionPrototype {
    static getPrototype(): AutomaticRenewalOfSubscriptionType {
        return {
            consumer: '1.2.X',
            subscription: '2.15.X',
            automatic_renewal: true,
        };
    }
}
