import {dcorejs_lib} from '../helpers';
import {ApiConnector} from './apiConnector';

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

export interface ChainMethod {
    name: string;
    param: any;
}

/**
 * Listing of methods available to be called
 * in blockchain.
 */
export class ChainMethods {
    static getAccount = 'getAccount';
    static getAsset = 'getAsset';
    static getObject = 'getObject';

    private _commands: ChainMethod[] = [];
    get commands(): ChainMethod[] {
        return this._commands;
    }

    add(method: string, params: any) {
        this._commands.push({name: method, param: params});
    }
}

export class ChainApi {

    static asset = 'DCT';
    static asset_id = '1.3.0';
    static DCTPower = Math.pow(10, 8);
    private _apiConnector: ApiConnector;
    private _chainStore: any;

    /**
     * Generates random sequence of bytes
     */
    public static generateNonce(): string {
        return dcorejs_lib.TransactionHelper.unique_nonce_uint64();
    }

    public static setupChain(chainId: string, chainConfig: any) {
        chainConfig.networks.decent = {
            chain_id: chainId
        };
    }

    constructor(apiConnector: ApiConnector, chainStore: any) {
        this._apiConnector = apiConnector;
        this._chainStore = chainStore;
    }

    /**
     * Fetches data from blockchain with given chain methods.
     *
     * Returns Promise.all with resolve result as array of results
     * in order of adding into ChainMethod
     *
     * @param {ChainMethods} methods
     * @return {Promise<any[]>}
     */
    public fetch(methods: ChainMethods): Promise<any[]> {
        return new Promise((resolve, reject) => {
            this._apiConnector
                .connect()
                .then(() => {
                    this._chainStore.init()
                        .then(() => {
                            const commands = methods.commands
                                .map(op => dcorejs_lib.FetchChain(op.name, op.param));
                            Promise.all(commands)
                                .then(result => resolve(result))
                                .catch(err => {
                                    const e = new Error(ChainError.command_execution_failed);
                                    e.stack = err;
                                    reject(e);
                                });
                        })
                        .catch(err => {
                            reject(err);
                        });
                })
                .catch(err => {
                    reject(err);
                });
        });
    }
}
