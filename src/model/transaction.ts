/**
 * @module Model/Transaction
 */
import {AssetOptions, UpdateMonitoredAssetParameters} from './asset';
import {Key, KeyParts, Price} from './content';
import {Block} from './explorer';
import AssetExchangeRate = Block.AssetExchangeRate;
import {Authority, Options} from './account';
import {MonitoredAssetOptions} from './asset';
import {Proposal} from './proposal';
import * as prototype from './operationPrototype';
import {OperationType} from './operationPrototype';

/**
 * OperationType to be broadcasted to blockchain
 * internal representation
 */
export class Operation {
    name: OperationName;
    operation: prototype.OperationType;

    constructor(name: OperationName, type?: prototype.OperationType) {
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
    message: string;
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
    miner_update_global_parameters = 'miner_update_global_parameters',
    proposal_create = 'proposal_create',
    proposal_update = 'proposal_update',
    operation_wrapper = 'op_wrapper',
    vesting_balance_withdraw = 'vesting_balance_withdraw',
    subscribe = 'subscribe',
    subscribe_by_author = 'subscribe_by_author',
    automatic_renewal_of_subscription = 'automatic_renewal_of_subscription',
    custom_operation = 'custom',
    update_monitored_asset_operation = 'update_monitored_asset_operation',
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

        static getPrototype(): prototype.TransferType {
            return prototype.TransferPrototype.getPrototype();
        }

        constructor(from: string, to: string, amount: Asset, memo: Memo) {
            const type: prototype.TransferType = { from: from, to: to, amount: amount, memo: memo };
            super(OperationName.transfer, type);
        }
    }

    export class ContentCancelOperation extends Operation {

        static getPrototype(): prototype.ContentCancellationType {
            return prototype.ContentCancelPrototype.getPrototype();
        }

        constructor(author: string, URI: string) {
            const type: prototype.ContentCancellationType = { author: author, URI: URI };
            super(OperationName.content_cancellation, type);
        }
    }

    export class BuyContentOperation extends Operation {

        static getPrototype(): prototype.BuyContentType {
            return prototype.BuyContentPrototype.getPrototype();
        }

        constructor(URI: string, consumer: string, price: Asset, region_code_from: number, pubKey: Key) {
            const type: prototype.BuyContentType = { URI: URI, consumer: consumer, price: price, region_code_from: region_code_from,
                pubKey: pubKey };
            super(OperationName.requestToBuy, type);
        }
    }

    export class SubmitContentOperation extends Operation {

        static getPrototype(): prototype.SubmitContentType {
            return prototype.SubmitContentPrototype.getPrototype();
        }

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
            const type: prototype.SubmitContentType = {
                size, author, co_authors, URI, quorum, price, hash, seeders, key_parts, expiration, publishing_fee, synopsis
            };
            super(OperationName.content_submit, type);
        }
    }

    export class AccountUpdateOperation extends Operation {

        static getPrototype(): prototype.UpdateAccountType {
            return prototype.UpdateAccountPrototype.getPrototype();
        }

        constructor(account: string, owner?: Authority, active?: Authority, new_options?: Options, extensions?: {}) {
            const type: prototype.UpdateAccountType = { account, owner, active, new_options, extensions };
            super(OperationName.account_update, type);
        }
    }

    export class AssetCreateOperation extends Operation {

        static getPrototype(): prototype.AssetCreateType {
            return prototype.AssetCreatePrototype.getPrototype();
        }

        constructor(issuer: string, symbol: string, precision: number, description: string, options: AssetOptions,
                    monitoredOptions: MonitoredAssetOptions = null) {
            const type: prototype.AssetCreateType = {issuer, symbol, precision, description, options,
                is_exchangeable: options.is_exchangeable, extensions: []};
            if (monitoredOptions) {
                type['monitored_asset_opts'] = monitoredOptions;
            }
            super(OperationName.asset_create, type);
        }
    }

    export class IssueAssetOperation extends Operation {

        static getPrototype(): prototype.IssueAssetType {
            return prototype.IssueAssetPrototype.getPrototype();
        }

        constructor(issuer: string, assetToIssue: Asset, issueToAccount: string, memo?: Memo) {
            const type: prototype.IssueAssetType = {
                issuer, asset_to_issue: assetToIssue, issue_to_account: issueToAccount, memo, extensions: {}
            };
            super(OperationName.issue_asset, type);
        }
    }

    export class UpdateAssetIssuedOperation extends Operation {

        static getPrototype(): prototype.UpdateIssuedAssetType {
            return prototype.UpdateUserIssuedAssetPrototype.getPrototype();
        }

        constructor(issuer: string, asset_to_update: string, new_description: string, max_supply: number,
                    core_exchange_rate: AssetExchangeRate, is_exchangeable: boolean, new_issuer?: string) {
            const type: prototype.UpdateIssuedAssetType = {
                issuer,
                asset_to_update,
                new_description,
                max_supply,
                core_exchange_rate,
                is_exchangeable,
                new_issuer,
                extensions: {}
            };
            super(OperationName.update_user_issued_asset, type);
        }
    }

    export class AssetFundPools extends Operation {

        static getPrototype(): prototype.AssetFundPoolsType {
            return prototype.AssetFundPoolsPrototype.getPrototype();
        }

        constructor(fromAccountId: string, uiaAsset: Asset, dctAsset: Asset) {
            const type: prototype.AssetFundPoolsType = {from_account: fromAccountId, uia_asset: uiaAsset, dct_asset: dctAsset};
            super(OperationName.asset_fund_pools_operation, type);
        }
    }

    export class AssetReserve extends Operation {

        static getPrototype(): prototype.AssetReserveType {
            return prototype.AssetReservePrototype.getPrototype();
        }

        constructor(payer: string, assetToReserve: Asset) {
            const type: prototype.AssetReserveType = {payer, amount_to_reserve: assetToReserve, extensions: {}};
            super(OperationName.asset_reserve_operation, type);
        }
    }

    export class AssetClaimFeesOperation extends Operation {

        static getPrototype(): prototype.AssetClaimFeesType {
            return prototype.AssetClaimFeesPrototype.getPrototype();
        }

        constructor(issuer: string, uiaAsset: Asset, dctAsset: Asset) {
            const type: prototype.AssetClaimFeesType = {issuer, uia_asset: uiaAsset, dct_asset: dctAsset, extensions: {}};
            super(OperationName.asset_claim_fees_operation, type);
        }
    }

    export class LeaveRatingAndComment extends Operation {

        static getPrototype(): prototype.LeaveRatingAndCommentType {
            return prototype.LeaveRatingAndCommentPrototype.getPrototype();
        }

        constructor(URI: string, consumer: string, comment: string, rating: number) {
            const type: prototype.LeaveRatingAndCommentType = {URI, consumer, comment, rating};
            super(OperationName.leave_rating_and_comment, type);
        }
    }

    export class AssetPublishFeed extends Operation {

        static getPrototype(): object {
            return prototype.AssetPublishFeedPrototype.getPrototype();
        }

        constructor(publisher: string, assetId: string, feed: PriceFeed) {
            const type: prototype.AssetPublishFeedType = {publisher, asset_id: assetId, feed, extensions: {}};
            super(OperationName.asset_publish_feed, type);
        }
    }

    export class MinerCreate extends Operation {

        static getPrototype(): prototype.MinerCreateType {
            return prototype.MinerCreatePrototype.getPrototype();
        }

        constructor(miner_account: string, url: string, block_signing_key: string) {
            const type: prototype.MinerCreateType = {miner_account, url, block_signing_key};
            super(OperationName.miner_create, type);
        }
    }

    export class MinerUpdate extends Operation {

        static getPrototype(): prototype.MinerUpdateType {
            return prototype.MinerUpdatePrototype.getPrototype();
        }

        constructor(miner: string, minerAccount: string, newURL: string = null, newSigningKey: string = null) {
            const type: prototype.MinerUpdateType = {miner, miner_account: minerAccount, new_url: newURL, new_signing_key: newSigningKey};
            super(OperationName.miner_update, type);
        }
    }

    export class MinerUpdateGlobalParameters extends Operation {

        static getPrototype(): prototype.MinerUpdateGlobalParametersType {
            return prototype.MinerUpdateGlobalParametersPrototype.getPrototype();
        }

        constructor(proposalParameters: Proposal) {
            const type: prototype.MinerUpdateGlobalParametersType = Object.assign({}, proposalParameters);
            super(OperationName.miner_update_global_parameters, type);
        }
    }

    export class ProposalCreate extends Operation {

        static getPrototype(): prototype.ProposalCreateType {
            return prototype.ProposalCreatePrototype.getPrototype();
        }

        constructor(feePayingAccount: string,
                    proposedOperations: OperationType[],
                    expirationTime: string,
                    reviewPeriodSeconds: number = null) {
            const type: prototype.ProposalCreateType = {fee_paying_account: feePayingAccount, proposed_ops: proposedOperations,
                expiration_time: expirationTime, review_period_seconds: reviewPeriodSeconds, extensions: []};
            super(OperationName.proposal_create, type);
        }
    }

    export class ProposalUpdate extends Operation {

        static getPrototype(): prototype.ProposalUpdateType {
            return prototype.ProposalUpdatePrototype.getPrototype();
        }

        constructor(feePayingAccount: string,
                    proposal: string,
                    activeApprovalsToAdd: Array<string>,
                    activeApprovalsToRemove: Array<string>,
                    ownerApprovalsToAdd: Array<string>,
                    ownerApprovalsToRemove: Array<string>,
                    keyApprovalsToAdd: Array<string>,
                    keyApprovalsToRemove: Array<string>) {
            const type: prototype.ProposalUpdateType = {
                fee_paying_account: feePayingAccount, proposal: proposal, active_approvals_to_add: activeApprovalsToAdd,
                active_approvals_to_remove: activeApprovalsToRemove, owner_approvals_to_add: ownerApprovalsToAdd,
                owner_approvals_to_remove: ownerApprovalsToRemove, key_approvals_to_add: keyApprovalsToAdd,
                key_approvals_to_remove: keyApprovalsToRemove, extensions: []};
            super(OperationName.proposal_update, type);
        }
    }

    export class OperationWrapper extends Operation {

        static getPrototype(): prototype.OperationWrapperType {
            return prototype.OperationWrapperPrototype.getPrototype();
        }

        constructor(operation: Operation) {
            const type: prototype.OperationWrapperType = {op: operation};
            super(OperationName.operation_wrapper, type);
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

        static getPrototype(): prototype.CreateAccountType {
            return prototype.CreateAccountPrototype.getPrototype();
        }

        constructor(params: CreateAccountParameters) {
            super(OperationName.account_create, params);
        }
    }

    export class VestingBalanceWithdraw extends Operation {

        static getPrototype(): prototype.VestingBalanceWithdrawType {
            return prototype.VestingBalanceWithdrawPrototype.getPrototype();
        }

        constructor(vestingBalanceId: string, ownerId: string, ammount: Asset) {
            const type: prototype.VestingBalanceWithdrawType = {vesting_balance: vestingBalanceId, owner: ownerId, amount: ammount};
            super(OperationName.vesting_balance_withdraw, type);
        }
    }

    export class Subscribe extends Operation {

        static getPrototype(): prototype.SubscribeType {
            return prototype.SubscribePrototype.getPrototype();
        }

        constructor(fromId: string, toId: string, price: Asset) {
            const type: prototype.SubscribeType = {from: fromId, to: toId, price: price};
            super(OperationName.subscribe, type);
        }
    }

    export class SubscribeByAuthor extends Operation {

        static getPrototype(): prototype.SubscribeByAuthorType {
            return prototype.SubscribeByAuthorPrototype.getPrototype();
        }

        constructor(fromId: string, toId: string) {
            const type: prototype.SubscribeByAuthorType = {from: fromId, to: toId};
            super(OperationName.subscribe_by_author, type);
        }
    }

    export class SetAutomaticRenewalOfSubscription extends Operation {

        static getPrototype(): prototype.AutomaticRenewalOfSubscriptionType {
            return prototype.SetAutomaticRenewalOfSubscriptionPrototype.getPrototype();
        }

        constructor(accountId: string, subscriptionId: string, automaticRenewal: boolean) {
            const type: prototype.AutomaticRenewalOfSubscriptionType = {
                consumer: accountId, subscription: subscriptionId, automatic_renewal: automaticRenewal};
            super(OperationName.automatic_renewal_of_subscription, type);
        }
    }

    export class CustomOperation extends Operation {
        constructor(payer: any, required_auths: any, id: number, data: any) {
            super(
                OperationName.custom_operation,
                {
                    payer,
                    required_auths,
                    id,
                    data
                }
            );
        }
    }

    export class UpdateMonitoredAssetOperation extends Operation {
        static getPrototype(): prototype.UpdateMonitoredAssetType {
            return prototype.UpdateMonitoredAssetPrototype.getPrototype();
        }

        constructor(params: UpdateMonitoredAssetParameters) {
            const type: prototype.UpdateMonitoredAssetType = Object.assign({}, params);
            super(OperationName.update_monitored_asset_operation, type);
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
    id: string;
    author: string;
    co_authors: [string, number];
    expiration: number;
    created: number;
    price: Price;
    synopsis: string;
    size: number;
    quorum: number;
    URI: string;
    key_parts: [string, string];
    last_proof: [string, number];
    seeder_price: [string, any];
    is_blocked: boolean;
    _hash: string;
    AVG_rating: number;
    num_of_ratings: number;
    times_bought: number;
    publishing_fee_escrow: Asset;
}
