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

export interface ProposalParameters {
    current_fees?: CurrentFeesParameters,
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
    miner_pay_vesting_seconds?: number;
    max_predicate_opcode?: number;
    max_authority_depth?: number;
    extensions?: Array<any>;
}

export interface ProposalCreateParameters {
    fee_paying_account: string,
    expiration_time: number,
    reviewPeriodSeconds?: number,
    extensions: Array<any>,
}

export interface CurrentFeesParameters {
    parameters: Array<[number, object]>;
    scale: number;
}

export interface Proposal {
    active_miners: Array<string>;
    id: string;
    next_available_vote_id: number;
    parameters: ProposalParameters;
    new_parameters?: ProposalParameters;
}

export interface DeltaParameters {

}

