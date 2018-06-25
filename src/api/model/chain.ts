export enum ChainOperationType {
    transfer = 0,
    account_create = 1,
    account_update = 2,
    asset_create = 3,
    asset_update = 4,
    asset_publish_feed = 5,
    witness_create = 6,
    witness_update = 7,
    witness_update_global_parameters = 8,
    proposal_create = 9,
    proposal_update = 10,
    proposal_delete = 11,
    withdraw_permission_create = 12,
    withdraw_permission_update = 13,
    withdraw_permission_claim = 14,
    withdraw_permission_delete = 15,
    vesting_balance_create = 16,
    vesting_balance_withdraw = 17,
    custom = 18,
    assert = 19,
    content_submit = 20,
    request_to_buy = 21,
    leave_rating_and_comment = 22,
    ready_to_publish = 23,
    proof_of_custody = 24,
    deliver_keys = 25,
    subscribe = 26,
    subscribe_by_author = 27,
    automatic_renewal_of_subscription = 28,
    report_stats = 29,
    set_publishing_manager = 30,
    set_publishing_right = 31,
    content_cancellation = 32,
    disallow_automatic_renewal_of_subscription = 33,
    return_escrow_submission = 34,
    return_escrow_buying = 35,
    pay_seeder = 36,
    finish_buying = 37,
    renewal_of_subscription = 38
}

export class ChainError {
    static command_execution_failed = 'command_execution_failed';
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
export type ChainSubscriptionCallback = (msg: any) => void;