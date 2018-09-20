import { Block } from '../../model/explorer';

/**
 * @module Model/Chain
 */
export enum ChainOperationType {
    transfer,
    account_create,
    account_update,
    asset_create,
    asset_issue,
    asset_publish_feed = 5,
    miner_create,
    miner_update,
    miner_update_global_parameters,
    proposal_create,
    proposal_update = 10,
    proposal_delete,
    withdraw_permission_create,
    withdraw_permission_update,
    withdraw_permission_claim,
    withdraw_permission_delete = 15,
    vesting_balance_create,
    vesting_balance_withdraw,
    custom,
    assert,
    content_submit = 20,
    request_to_buy,
    leave_rating_and_comment,
    ready_to_publish,
    proof_of_custody,
    deliver_keys = 25,
    subscribe,
    subscribe_by_author,
    automatic_renewal_of_subscription,
    report_stats,
    set_publishing_manager = 30,
    set_publishing_right,
    content_cancellation,
    asset_fund_pools,
    asset_reserve,
    asset_claim_fees = 35,
    update_user_issued_asset,
    update_monitored_asset,
    ready_to_publish2,
    transfer2,
    disallow_automatic_renewal_of_subscription = 40,
    return_escrow_submission,
    return_escrow_buying,
    pay_seeder,
    finish_buying,
    renewal_of_subscription = 45,
}

export enum ChainError {
    command_execution_failed = 'command_execution_failed',
    connection_failed = 'connection_failed'
}

export enum ChainMethodName {
    getAccount = 'getAccount',
    getAsset = 'getAsset',
    getObject = 'getObject'
}

export class Method {
    protected _name: ChainMethodName;
    protected _parameters: any;

    get name(): ChainMethodName {
        return this._name;
    }

    get parameters(): any {
        return this._parameters;
    }

    constructor(methodName: ChainMethodName, params: any) {
        this._name = methodName;
        this._parameters = params;
    }
}

export namespace ChainMethods {
    export class GetAccount extends Method {
        constructor(account: string) {
            super(ChainMethodName.getAccount, account);
        }
    }

    export class GetAsset extends Method {
        constructor(assetId: string) {
            super(ChainMethodName.getAsset, assetId);
        }
    }
}
export type ChainSubscriptionCallback = (msg: Block.Transaction) => void;
export type ChainSubscriptionBlockAppliedCallback = (msg: number) => void;
