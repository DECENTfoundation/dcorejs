/**
 * @module Model/Proposal
 */
import {Block} from './explorer';
import Transaction = Block.Transaction;


export enum ProposalError {
    database_operation_failed = 'database_operation_failed',
    chain_operation_failed = 'chain_operation_failed',
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    account_does_not_exist = 'account_does_not_exist',
    account_fetch_failed = 'account_fetch_failed',
    transfer_sender_account_does_not_exist = 'transfer_sender_account_does_not_exist',
    transfer_receiver_account_does_not_exist = 'transfer_receiver_account_does_not_exist',
    asset_not_found = 'asset_not_found',
    propose_object_not_found = 'propose_object_not_found',
    api_connection_failed = 'api_connection_failed',
    syntactic_error = 'syntactic_error',
    invalid_parameters = 'invalid_parameters',
}

export interface ProposalObject {
    expiration_time: number;
    review_period_time?: number;
    proposed_transaction: Transaction;
    required_active_approvals: Array<string>;
    available_active_approvals: Array<string>;
    required_owner_approvals: Array<string>;
    available_owner_approvals: Array<string>;
    available_key_approvals: Array<string>;
}

export interface IProposalParameters {
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

export class ProposalParameters implements IProposalParameters {
    current_fees?: {
        parameters: Array<[number, object]>;
        scale: number;
    } = null;
    block_interval: number = null;
    maintenance_interval: number = null;
    maintenance_skip_slots: number = null;
    miner_proposal_review_period: number = null;
    maximum_transaction_size: number = null;
    maximum_block_size: number = null;
    maximum_time_until_expiration: number = null;
    maximum_proposal_lifetime: number = null;
    maximum_asset_feed_publishers: number = null;
    maximum_miner_count: number = null;
    maximum_authority_membership: number = null;
    cashback_vesting_period_seconds: number = null;
    cashback_vesting_threshold: number = null;
    max_predicate_opcode: number = null;
    max_authority_depth: number = null;
    extensions: Array<any> = null;
}

export interface IProposalCreateParameters {
    fee_paying_account: string,
    expiration_time: string,
    review_period_seconds?: number,
    extensions: Array<any>,
}

export class ProposalCreateParameters implements IProposalCreateParameters {
    fee_paying_account = '';
    expiration_time = '';
    review_period_seconds?: number = null;
    extensions: Array<any>;
}

export interface Fee {
    fee: number;
    price_per_kbyte?: number;
}

export interface BasicFee {
    basic_fee: number
}

export interface IFeesParameters {
    transfer?: Fee; // 0
    account_create?: BasicFee;
    account_update?: Fee;
    asset_create?: BasicFee;
    asset_update?: Fee;
    asset_publish_feed?: Fee; // 5
    miner_create?: Fee;
    miner_update?: Fee;
    miner_update_global_parameters?: Fee;
    proposal_create?: Fee;
    proposal_update?: Fee; // 10
    proposal_delete?: Fee;
    withdraw_permission_create?: Fee;
    withdraw_permission_update?: Fee;
    withdraw_permission_claim?: Fee;
    withdraw_permission_delete?: Fee; // 15
    vesting_balance_create?: Fee;
    vesting_balance_withdraw?: Fee;
    custom?: Fee;
    assert?: Fee;
    content_submit?: Fee; // 20
    request_to_buy?: Fee;
    leave_rating_and_comment?: Fee;
    ready_to_publish?: Fee;
    proof_of_custody?: Fee;
    deliver_keys?: Fee; // 25
    subscribe?: Fee;
    subscribe_by_author?: Fee;
    automatic_renewal_of_subscription?: Fee;
    report_stats?: Fee;
    set_publishing_manager?: Fee; // 30
    set_publishing_right?: Fee;
    content_cancellation?: Fee;
    asset_fund_pools_operation?: Fee;
    asset_reserve_operation?: Fee;
    asset_claim_fees_operation?: Fee; // 35
    update_user_issued_asset?: Fee;
    update_monitored_asset_operation?: Fee;
    ready_to_publish2?: Fee;
    transfer2?: Fee;
    disallow_automatic_renewal_of_subscription?: Fee; // 40
    return_escrow_submission?: Fee;
    return_escrow_buying?: Fee;
    pay_seeder?: Fee;
    finish_buying?: Fee;
    renewal_of_subscription?: Fee; // 45
}

export class FeesParameters implements IFeesParameters {
    transfer?: Fee = null; // 0
    account_create?: BasicFee = null;
    account_update?: Fee = null;
    asset_create?: BasicFee = null;
    asset_update?: Fee = null;
    asset_publish_feed?: Fee = null; // 5
    miner_create?: Fee = null;
    miner_update?: Fee = null;
    miner_update_global_parameters?: Fee = null;
    proposal_create?: Fee = null;
    proposal_update?: Fee = null; // 10
    proposal_delete?: Fee = null;
    withdraw_permission_create?: Fee = null;
    withdraw_permission_update?: Fee = null;
    withdraw_permission_claim?: Fee = null;
    withdraw_permission_delete?: Fee = null; // 15
    vesting_balance_create?: Fee = null;
    vesting_balance_withdraw?: Fee = null;
    custom?: Fee = null;
    assert?: Fee = null;
    content_submit?: Fee = null; // 20
    request_to_buy?: Fee = null;
    leave_rating_and_comment?: Fee = null;
    ready_to_publish?: Fee = null;
    proof_of_custody?: Fee = null;
    deliver_keys?: Fee = null; // 25
    subscribe?: Fee = null;
    subscribe_by_author?: Fee = null;
    automatic_renewal_of_subscription?: Fee = null;
    report_stats?: Fee = null;
    set_publishing_manager?: Fee = null; // 30
    set_publishing_right?: Fee = null;
    content_cancellation?: Fee = null;
    asset_fund_pools_operation?: Fee = null;
    asset_reserve_operation?: Fee = null;
    asset_claim_fees_operation?: Fee = null; // 35
    update_user_issued_asset?: Fee = null;
    update_monitored_asset_operation?: Fee = null;
    ready_to_publish2?: Fee = null;
    transfer2?: Fee = null;
    disallow_automatic_renewal_of_subscription?: Fee = null; // 40
    return_escrow_submission?: Fee = null;
    return_escrow_buying?: Fee = null;
    pay_seeder?: Fee = null;
    finish_buying?: Fee = null;
    renewal_of_subscription?: Fee = null; // 45
}

export interface Proposal {
    new_parameters: IProposalParameters;
}

export interface IDeltaParameters {
    active_approvals_to_add: Array<string>;
    active_approvals_to_remove: Array<string>;
    owner_approvals_to_add: Array<string>;
    owner_approvals_to_remove: Array<string>;
    key_approvals_to_add: Array<string>;
    key_approvals_to_remove: Array<string>;
}

export class DeltaParameters implements IDeltaParameters {
    active_approvals_to_add: Array<string>;
    active_approvals_to_remove: Array<string>;
    owner_approvals_to_add: Array<string>;
    owner_approvals_to_remove: Array<string>;
    key_approvals_to_add: Array<string>;
    key_approvals_to_remove: Array<string>;
}
