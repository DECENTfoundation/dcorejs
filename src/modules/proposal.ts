/**
 * @module ProposalModule
 */
import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {
    FeesParameters, DeltaParameters, Proposal, ProposalError, ProposalObject,
    ProposalParameters, ProposalCreateParameters
} from '../model/proposal';
import {Memo, Operations} from '../model/transaction';
import {TransactionBuilder} from '../transactionBuilder';
import {Asset} from '../model/account';
import {ChainApi} from '../api/chain';
import {CryptoUtils} from '../crypt';
import {ApiConnector} from '../api/apiConnector';
import {ChainMethods} from '../api/model/chain';
import {AssetError} from '../model/asset';
import {Type} from '../model/types';
import { Validator } from './validator';

export class ProposalModule extends ApiModule {
    constructor(dbApi: DatabaseApi, chainApi: ChainApi, apiConnector: ApiConnector) {
        super({
            dbApi,
            chainApi,
            apiConnector
        });
    }

    /**
     * Gets proposed transactions from account by given account id.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#acb443f4bc6ab17f303ce3e938382d944
     *
     * @param {string} accountId                        Account id in format '1.2.X'. Example: "1.2.345"
     * @returns {Promise<ProposalObject[]>}
     */
    public getProposedTransactions(accountId: string): Promise<ProposalObject[]> {
        if (!Validator.validateArguments(arguments, [Type.string])) {
            throw new TypeError(ProposalError.invalid_parameters);
        }
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

    /**
     * Propose transfer operation between two accounts.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a0409c11498829d114a4827e3c3e7beca
     *
     * @param {string} proposerAccountId                Account id in format '1.2.X'. Example: "1.2.345"
     * @param {string} fromAccountId                    Account id in format '1.2.X'. Example: "1.2.345"
     * @param {string} toAccountId                      Account id in format '1.2.X'. Example: "1.2.345"
     * @param {number} amount                           Amount that will be sent.
     * @param {string} assetId                          Asset id that amount will be sent in. Asset id in format '1.3.X'. Example: "1.3.0"
     * @param {string} memoKey                          Public key used to memo encryption in WIF(hex)(Wallet Import Format) format.
     * @param {string} expiration                       Date in ISO format. Example: "2018-07-17T16:00:00"
     * @param {string} privateKey                       Private key used to sign transaction.
     * @returns {Promise<boolean>}
     */
    public proposeTransfer(
        proposerAccountId: string, fromAccountId: string, toAccountId: string, amount: number, assetId: string, memoKey: string,
        expiration: string, privateKey: string): Promise<boolean> {
        if (!Validator.validateArguments(arguments, [Type.string, Type.string, Type.string, Type.number, Type.string, Type.string,
            Type.string, Type.string])) {
            throw new TypeError(ProposalError.invalid_parameters);
        }
        return new Promise<boolean>(((resolve, reject) => {
            const operations = [].concat(
                new ChainMethods.GetAccount(fromAccountId),
                new ChainMethods.GetAccount(toAccountId),
                new ChainMethods.GetAsset(assetId)
            );
            this.chainApi.fetch(...operations)
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
                const memo: Memo = {
                    from: fromPublicKey,
                    to: toPublicKey,
                    nonce: nonce,
                    message: CryptoUtils.encryptWithChecksum(memoKey, privateKey, toPublicKey, nonce)
                };

                const getGlobalPropertiesOperation = new DatabaseOperations.GetGlobalProperties();
                this.dbApi.execute(getGlobalPropertiesOperation)
                    .then(globalProperties => {
                        const price = Asset.create(amount, assetObject);
                        const transferOperation = new Operations.TransferOperation(fromAccountId, toAccountId, price, memo);
                        const transaction = new TransactionBuilder();
                        transaction.addOperation(transferOperation);
                        const proposalCreateParameters: ProposalCreateParameters = {
                            fee_paying_account: proposerAccountId,
                            expiration_time: expiration,
                            review_period_seconds: globalProperties.parameters.miner_proposal_review_period,
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
                        reject(this.handleError(AssetError.database_operation_failed, error));
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
     * Propose for global parameters change
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#ab05cd1249b4e3da5ce4707d78160493e
     *
     * @param {string} proposerAccountId                    Account id in format '1.2.X'. Example: "1.2.345"
     * @param {ProposalParameters} proposalParameters       Global parameters that are proposed to be changed. Fill only these parameters
     *                                                      that you wish to be changed.
     * @param {string} expiration                           Date in ISO format. Example: "2018-07-17T16:00:00", min is 14 days since today,
     *                                                      max is 28 days since today.
     * @param {string} privateKey                           Private key used to sign transaction.
     * @returns {Promise<boolean>}
     */
    public proposeParameterChange(proposerAccountId: string, proposalParameters: ProposalParameters, expiration: string,
                                  privateKey: string): Promise<boolean> {
        if (!Validator.validateArguments([proposerAccountId, expiration, privateKey], [Type.string, Type.string, Type.string])
            || !Validator.validateObject<ProposalParameters>(proposalParameters, ProposalParameters)) {
            throw new TypeError(ProposalError.invalid_parameters);
        }
        return new Promise<boolean>(((resolve, reject) => {
            const databaseOperation = new DatabaseOperations.GetGlobalProperties();
            this.dbApi.execute(databaseOperation)
                .then(globalParam => {
                    const globalParameters = JSON.parse(JSON.stringify(globalParam));
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
                    const transaction = new TransactionBuilder();

                    transaction.addOperation(operation);
                    const proposalCreateParameters: ProposalCreateParameters = {
                        fee_paying_account: proposerAccountId,
                        expiration_time: expiration,
                        review_period_seconds: globalParam.parameters.miner_proposal_review_period,
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
                    return;
                });
        }));
    }

    /**
     * Propose change of global fees for operations
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a463772cd2a9b5cbe7526d9ac5ace630b
     *
     * @param {string} proposerAccountId                    Account id in format '1.2.X'. Example: "1.2.345"
     * @param {FeesParameters} feesParameters               Fee parameters that are proposed to be changed. Fill only these parameters
     *                                                      that you wish to be changed.
     * @param {string} expiration                           Date in ISO format. Example: "2018-07-17T16:00:00", min is 14 days since today,
     *                                                      max is 28 days since today.
     * @param {string} privateKey                           Private key used to sign transaction.
     * @returns {Promise<boolean>}
     */
    public proposeFeeChange(proposerAccountId: string, feesParameters: FeesParameters, expiration: string, privateKey: string):
                            Promise<boolean> {
        if (!Validator.validateArguments([proposerAccountId, expiration, privateKey], [Type.string, Type.string, Type.string])
            || !Validator.validateObject<FeesParameters>(feesParameters, FeesParameters)) {
            throw new TypeError(ProposalError.invalid_parameters);
        }
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
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(operation);
                    const proposalCreateParameters: ProposalCreateParameters = {
                        fee_paying_account: proposerAccountId,
                        expiration_time: expiration,
                        review_period_seconds: currentParameters.parameters.miner_proposal_review_period,
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
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#ac5c00d5de5f1e93f6d1c636a83bf1605
     *
     * @param {string} payingAccountId                  Account id in format '1.2.X'. Example: "1.2.345"
     * @param {string} proposalId                       Proposal id in format '1.6.X'. Example "1.6.100"
     * @param {DeltaParameters} approvalsDelta          Active keys, owner keys and key approvals that you can add or remove.
     * @param {string} privateKey                       Private key used to sign transaction.
     * @returns {Promise<boolean>}
     */

    public approveProposal(
        payingAccountId: string, proposalId: string, approvalsDelta: DeltaParameters, privateKey: string): Promise<boolean> {
        if (!Validator.validateArguments([payingAccountId, proposalId, privateKey], [Type.string, Type.string, Type.string])
            || !Validator.validateObject<DeltaParameters>(approvalsDelta, DeltaParameters)) {
            throw new TypeError(ProposalError.invalid_parameters);
        }
        return new Promise<boolean>(((resolve, reject) => {
            this.apiConnector.connection()
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
                    const transaction = new TransactionBuilder();
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
                .catch(error => {
                    reject(this.handleError(ProposalError.connection_failed, error));
                });
        }));
    }

}
