import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {
    FeesParameters, DeltaParameters, Proposal, ProposalCreateParameters, ProposalError, ProposalObject,
    ProposalParameters
} from '../model/proposal';
import {Memo, Operations} from '../model/transaction';
import {Transaction} from '../transaction';
import {Asset} from '../model/account';
import {ChainApi, ChainMethods} from '../api/chain';
import {Utils} from '../utils';
import {CryptoUtils} from '../crypt';
import {ApiConnector} from '../api/apiConnector';

export class ProposalModule extends ApiModule {
    private _chainApi: ChainApi;
    private _apiConnector: ApiConnector;

    constructor(dbApi: DatabaseApi, chainApi: ChainApi, apiConnector: ApiConnector) {
        super(dbApi);
        this._chainApi = chainApi;
        this._apiConnector = apiConnector;
    }

    public getProposedTransactions(accountId: string): Promise<ProposalObject[]> {
        return new Promise<ProposalObject[]>((resolve, reject) => {
            const operation = new DatabaseOperations.GetProposedTransactions(accountId);
            this.dbApi.execute(operation)
                .then(result => {
                    resolve(result);
                })
                .catch(error => {
                    reject(this.handleError(ProposalError.database_operation_failed, error));
                });
        });
    }

    public proposeTransfer(
        proposerAccountId: string, fromAccountId: string, toAccountId: string, amount: number, assetId: string, memoKey: string,
        expiration: string, privateKey: string): Promise<any> {
        return new Promise<any>(((resolve, reject) => {
            const operations = new ChainMethods();
            operations.add(ChainMethods.getAccount, fromAccountId);
            operations.add(ChainMethods.getAccount, toAccountId);
            operations.add(ChainMethods.getAsset, assetId);

            this._chainApi.fetch(operations)
            .then(result => {
                const [senderAccount, receiverAccount, asset] = result;
                const senderAccountObject = JSON.parse(JSON.stringify(senderAccount));
                const receiverAccountObject = JSON.parse(JSON.stringify(receiverAccount));
                const assetObject = JSON.parse(JSON.stringify(asset));

                if (!senderAccountObject) {
                    reject(this.handleError(ProposalError.transfer_sender_account_does_not_exist));
                    return;
                }
                if (!receiverAccountObject) {
                    reject(this.handleError(ProposalError.transfer_receiver_account_does_not_exist));
                    return;
                }
                if (!assetObject) {
                    reject(this.handleError(ProposalError.asset_not_found));
                    return;
                }

                const nonce: string = ChainApi.generateNonce();
                const fromPublicKey = senderAccountObject.options.memo_key;
                const toPublicKey = receiverAccountObject.options.memo_key;
                const privateKeyObject = Utils.privateKeyFromWif(privateKey);
                const publicKeyObject = Utils.publicKeyFromString(toPublicKey);
                const memo: Memo = {
                    from: fromPublicKey,
                    to: toPublicKey,
                    nonce: nonce,
                    message: CryptoUtils.encryptWithChecksum(memoKey, privateKeyObject, publicKeyObject, nonce)
                };

                const price = Asset.create(amount, assetObject);
                const transferOperation = new Operations.TransferOperation(fromAccountId, toAccountId, price, memo);
                const transaction = new Transaction();
                transaction.addOperation(transferOperation);
                const proposalCreateParameters: ProposalCreateParameters = {
                    fee_paying_account: proposerAccountId,
                    expiration_time: expiration,
                    extensions: []
                };
                transaction.propose(proposalCreateParameters);
                transaction.broadcast(privateKey)
                    .then(() => {
                        resolve(true);
                    })
                    .catch(error => {
                        reject(this.handleError(ProposalError.transaction_broadcast_failed, error));
                        return;
                    });
                })
            .catch(error => {
                reject(this.handleError(ProposalError.chain_operation_failed, error));
                return;
            });
        }));
    }

    /**
     * Propose change of global fees for operations
     *
     * @param {string} proposerAccountId                    Account which pays fee for propose operation.
     * @param {ProposalParameters} proposalParameters       Global parameters that should be changed.
     * @param {number} reviewPeriodInDays                   Min is 14, max is 27.
     * @param {string} expiration                           Date in form of "2018-07-17T16:00:00", depends on reviewPeriodInDays.
     *                                                      If reviewPeriodInDays is 14, expiration must be at least 14 days since today,
     *                                                      max is always 27 days since today.
     * @param {string} privateKey                           Private key for signing transaction.
     * @returns {Promise<boolean>}
     */
    public proposeParameterChange(proposerAccountId: string, proposalParameters: ProposalParameters, reviewPeriodInDays: number,
                                  expiration: string, privateKey: string): Promise<boolean> {
        return new Promise<boolean>(((resolve, reject) => {
            const databaseOperation = new DatabaseOperations.GetGlobalProperties();
            this.dbApi.execute(databaseOperation)
                .then(result => {
                    const globalParameters = JSON.parse(JSON.stringify(result));
                    const newParameters: Proposal = {
                        new_parameters: Object.assign({}, globalParameters.parameters),
                    };

                    if (proposalParameters.current_fees !== undefined) {
                        newParameters.new_parameters.current_fees = Object.assign({}, proposalParameters.current_fees);
                    }
                    if (proposalParameters.block_interval !== undefined) {
                        newParameters.new_parameters.block_interval = proposalParameters.block_interval;
                    }
                    if (proposalParameters.maintenance_interval !== undefined) {
                        newParameters.new_parameters.maintenance_interval = proposalParameters.maintenance_interval;
                    }
                    if (proposalParameters.maintenance_skip_slots !== undefined) {
                        newParameters.new_parameters.maintenance_skip_slots = proposalParameters.maintenance_skip_slots;
                    }
                    if (proposalParameters.miner_proposal_review_period !== undefined) {
                        newParameters.new_parameters.miner_proposal_review_period = proposalParameters.miner_proposal_review_period;
                    }
                    if (proposalParameters.maximum_transaction_size !== undefined) {
                        newParameters.new_parameters.maximum_transaction_size = proposalParameters.maximum_transaction_size;
                    }
                    if (proposalParameters.maximum_block_size !== undefined) {
                        newParameters.new_parameters.maximum_block_size = proposalParameters.maximum_block_size;
                    }
                    if (proposalParameters.maximum_time_until_expiration !== undefined) {
                        newParameters.new_parameters.maximum_time_until_expiration = proposalParameters.maximum_time_until_expiration;
                    }
                    if (proposalParameters.maximum_proposal_lifetime !== undefined) {
                        newParameters.new_parameters.maximum_proposal_lifetime = proposalParameters.maximum_proposal_lifetime;
                    }
                    if (proposalParameters.maximum_asset_feed_publishers !== undefined) {
                        newParameters.new_parameters.maximum_asset_feed_publishers = proposalParameters.maximum_asset_feed_publishers;
                    }
                    if (proposalParameters.maximum_miner_count !== undefined) {
                        newParameters.new_parameters.maximum_miner_count = proposalParameters.maximum_miner_count;
                    }
                    if (proposalParameters.maximum_authority_membership !== undefined) {
                        newParameters.new_parameters.maximum_authority_membership = proposalParameters.maximum_authority_membership;
                    }
                    if (proposalParameters.cashback_vesting_period_seconds !== undefined) {
                        newParameters.new_parameters.cashback_vesting_period_seconds = proposalParameters.cashback_vesting_period_seconds;
                    }
                    if (proposalParameters.cashback_vesting_threshold !== undefined) {
                        newParameters.new_parameters.cashback_vesting_threshold = proposalParameters.cashback_vesting_threshold;
                    }
                    if (proposalParameters.max_predicate_opcode !== undefined) {
                        newParameters.new_parameters.max_predicate_opcode = proposalParameters.max_predicate_opcode;
                    }
                    if (proposalParameters.max_authority_depth !== undefined) {
                        newParameters.new_parameters.max_authority_depth = proposalParameters.max_authority_depth;
                    }
                    if (proposalParameters.extensions !== undefined) {
                        newParameters.new_parameters.extensions = proposalParameters.extensions;
                    }

                    const operation = new Operations.MinerUpdateGlobalParameters(newParameters);
                    const transaction = new Transaction();
                    transaction.addOperation(operation);
                    const proposalCreateParameters: ProposalCreateParameters = {
                        fee_paying_account: proposerAccountId,
                        expiration_time: expiration,
                        review_period_seconds: this.convertDaysToSeconds(reviewPeriodInDays),
                        extensions: [],
                    };
                    transaction.propose(proposalCreateParameters);
                    transaction.broadcast(privateKey)
                        .then(() => {
                            resolve(true);
                        })
                        .catch(error => {
                            reject(this.handleError(ProposalError.transaction_broadcast_failed, error));
                            return;
                        });
                })
                .catch(error => {
                    reject(this.handleError(ProposalError.database_operation_failed, error));
                });
        }));
    }

    /**
     * Propose change of global fees for operations
     *
     * @param {string} proposerAccountId                Account which pays fee for propose operation.
     * @param {FeesParameters} feesParameters           Fees that should be changed.
     * @param {number} reviewPeriodInDays               Min is 14, max is 27.
     * @param {string} expiration                       Date in form of "2018-07-17T16:00:00", depends on reviewPeriodInDays.
     *                                                  If reviewPeriodInDays is 14, expiration must be at least 14 days since today,
     *                                                  max is always 27 days since today.
     * @param {string} privateKey                       Private key for signing transaction.
     * @returns {Promise<boolean>}
     */
    public proposeFeeChange(proposerAccountId: string, feesParameters: FeesParameters, reviewPeriodInDays: number, expiration: string,
                            privateKey: string): Promise<boolean> {
        return new Promise<boolean>(((resolve, reject) => {
            const databaseOperation = new DatabaseOperations.GetGlobalProperties();
            this.dbApi.execute(databaseOperation)
                .then(currentParameters => {
                    const newParameters: Proposal = {
                        new_parameters: Object.assign({}, currentParameters.parameters),
                    };

                    if (feesParameters.transfer !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[0] = [0, feesParameters.transfer];
                    }
                    if (feesParameters.account_create !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[1] = [1, feesParameters.account_create];
                    }
                    if (feesParameters.account_update !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[2] = [2, feesParameters.account_update];
                    }
                    if (feesParameters.asset_create !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[3] = [3, feesParameters.asset_create];
                    }
                    if (feesParameters.asset_update !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[4] = [4, feesParameters.asset_update];
                    }
                    if (feesParameters.asset_publish_feed !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[5] = [5, feesParameters.asset_publish_feed];
                    }
                    if (feesParameters.miner_create !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[6] = [6, feesParameters.miner_create];
                    }
                    if (feesParameters.miner_update !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[7] = [7, feesParameters.miner_update];
                    }
                    if (feesParameters.miner_update_global_parameters !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[8] = [8, feesParameters.miner_update_global_parameters];
                    }
                    if (feesParameters.proposal_create !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[9] = [9, feesParameters.proposal_create];
                    }
                    if (feesParameters.proposal_update !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[10] = [10, feesParameters.proposal_update];
                    }
                    if (feesParameters.proposal_delete !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[11] = [11, feesParameters.proposal_delete];
                    }
                    if (feesParameters.withdraw_permission_create !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[12] = [12, feesParameters.withdraw_permission_create];
                    }
                    if (feesParameters.withdraw_permission_update !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[13] = [13, feesParameters.withdraw_permission_update];
                    }
                    if (feesParameters.withdraw_permission_claim !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[14] = [14, feesParameters.withdraw_permission_claim];
                    }
                    if (feesParameters.withdraw_permission_delete !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[15] = [15, feesParameters.withdraw_permission_delete];
                    }
                    if (feesParameters.vesting_balance_create !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[16] = [16, feesParameters.vesting_balance_create];
                    }
                    if (feesParameters.vesting_balance_withdraw !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[17] = [17, feesParameters.vesting_balance_withdraw];
                    }
                    if (feesParameters.custom !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[18] = [18, feesParameters.custom];
                    }
                    if (feesParameters.assert !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[19] = [19, feesParameters.assert];
                    }
                    if (feesParameters.content_submit !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[20] = [20, feesParameters.content_submit];
                    }
                    if (feesParameters.request_to_buy !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[21] = [21, feesParameters.request_to_buy];
                    }
                    if (feesParameters.leave_rating_and_comment !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[22] = [22, feesParameters.leave_rating_and_comment];
                    }
                    if (feesParameters.ready_to_publish !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[23] = [23, feesParameters.ready_to_publish];
                    }
                    if (feesParameters.proof_of_custody !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[24] = [24, feesParameters.proof_of_custody];
                    }
                    if (feesParameters.deliver_keys !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[25] = [25, feesParameters.deliver_keys];
                    }
                    if (feesParameters.subscribe !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[26] = [26, feesParameters.subscribe];
                    }
                    if (feesParameters.subscribe_by_author !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[27] = [27, feesParameters.subscribe_by_author];
                    }
                    if (feesParameters.automatic_renewal_of_subscription !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[28] = [28, feesParameters.automatic_renewal_of_subscription];
                    }
                    if (feesParameters.report_stats !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[29] = [29, feesParameters.report_stats];
                    }
                    if (feesParameters.set_publishing_manager !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[30] = [30, feesParameters.set_publishing_manager];
                    }
                    if (feesParameters.set_publishing_right !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[31] = [31, feesParameters.set_publishing_right];
                    }
                    if (feesParameters.content_cancellation !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[32] = [32, feesParameters.content_cancellation];
                    }
                    if (feesParameters.asset_fund_pools_operation !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[33] = [33, feesParameters.asset_fund_pools_operation];
                    }
                    if (feesParameters.asset_reserve_operation !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[34] = [34, feesParameters.asset_reserve_operation];
                    }
                    if (feesParameters.asset_claim_fees_operation !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[35] = [35, feesParameters.asset_claim_fees_operation];
                    }
                    if (feesParameters.update_user_issued_asset !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[36] = [36, feesParameters.update_user_issued_asset];
                    }
                    if (feesParameters.update_monitored_asset_operation !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[37] = [37, feesParameters.update_monitored_asset_operation];
                    }
                    if (feesParameters.ready_to_publish2 !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[38] = [38, feesParameters.ready_to_publish2];
                    }
                    if (feesParameters.transfer2 !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[39] = [39, feesParameters.transfer2];
                    }
                    if (feesParameters.disallow_automatic_renewal_of_subscription !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[40]
                            = [40, feesParameters.disallow_automatic_renewal_of_subscription];
                    }
                    if (feesParameters.return_escrow_submission !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[41] = [41, feesParameters.return_escrow_submission];
                    }
                    if (feesParameters.return_escrow_buying !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[42] = [42, feesParameters.return_escrow_buying];
                    }
                    if (feesParameters.pay_seeder !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[43] = [43, feesParameters.pay_seeder];
                    }
                    if (feesParameters.finish_buying !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[44] = [44, feesParameters.finish_buying];
                    }
                    if (feesParameters.renewal_of_subscription !== undefined) {
                        newParameters.new_parameters.current_fees.parameters[45] = [45, feesParameters.renewal_of_subscription];
                    }

                    const operation = new Operations.MinerUpdateGlobalParameters(newParameters);
                    const transaction = new Transaction();
                    transaction.addOperation(operation);
                    const proposalCreateParameters: ProposalCreateParameters = {
                        fee_paying_account: proposerAccountId,
                        expiration_time: expiration,
                        review_period_seconds: this.convertDaysToSeconds(reviewPeriodInDays),
                        extensions: [],
                    };
                    transaction.propose(proposalCreateParameters);
                    transaction.broadcast(privateKey)
                        .then(() => {
                            resolve(true);
                        })
                        .catch(error => {
                            reject(this.handleError(ProposalError.transaction_broadcast_failed, error));
                            return;
                        });
                })
                .catch(error => {
                    reject(this.handleError(ProposalError.database_operation_failed));
                    return;
                });
        }));
    }

    /**
     * Approve proposal operation
     *
     * @param {string} payingAccountId                  Account which pays fee for this operation.
     * @param {string} proposalId                       Id of proposal that you want to approve.
     * @param {DeltaParameters} approvalsDelta          Active keys, owner keys and key approvals that you can add or remove.
     * @param {string} privateKey                       Private key for signing transaction.
     * @returns {Promise<boolean>}
     */

    public approveProposal(
        payingAccountId: string, proposalId: string, approvalsDelta: DeltaParameters, privateKey: string): Promise<boolean> {
        return new Promise<boolean>(((resolve, reject) => {
            this._apiConnector.connect()
                .then(() => {
                    const operation = new Operations.ProposalUpdate(
                        payingAccountId,
                        proposalId,
                        approvalsDelta.active_approvals_to_add,
                        approvalsDelta.active_approvals_to_remove,
                        approvalsDelta.owner_approvals_to_add,
                        approvalsDelta.owner_approvals_to_remove,
                        approvalsDelta.key_approvals_to_add,
                        approvalsDelta.key_approvals_to_remove
                    );
                    const transaction = new Transaction();
                    transaction.addOperation(operation);
                    transaction.broadcast(privateKey)
                        .then(() => {
                            resolve(true);
                        })
                        .catch(error => {
                            reject(this.handleError(ProposalError.transaction_broadcast_failed, error));
                            return;
                        });
                })
                .catch();
        }));
    }

    private convertDaysToSeconds(days: number): number {
        return days * 24 * 60 * 60;
    }
}
