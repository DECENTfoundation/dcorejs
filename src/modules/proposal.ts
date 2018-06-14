import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {
    CurrentFeesParameters, DeltaParameters, ProposalCreateParameters, ProposalError, ProposalObject,
    ProposalParameters
} from '../model/proposal';
import {Memo, Operations} from '../model/transaction';
import {Transaction} from '../transaction';
import {Asset} from '../model/account';
import {ChainApi, ChainMethods} from '../api/chain';
import {Utils} from '../utils';
import {CryptoUtils} from '../crypt';

export class ProposalModule extends ApiModule {
    private _chainApi: ChainApi;

    constructor(dbApi: DatabaseApi, chainApi: ChainApi) {
        super(dbApi);
        this._chainApi = chainApi;
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
        expiration: number, privateKey: string): Promise<any> {
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
                transaction.add(transferOperation);
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

    public proposeParameterChange(
        proposerAccountId: string, expiration: number, proposalParameters: ProposalParameters, privateKey: string): Promise<boolean> {
        return new Promise<boolean>(((resolve, reject) => {
            const databaseOperation = new DatabaseOperations.GetGlobalProperties();
            this.dbApi.execute(databaseOperation)
                .then(result => {
                    const globalParameters = JSON.parse(JSON.stringify(result));
                    if (proposalParameters.current_fees !== undefined) {
                        globalParameters.parameters.current_fees = Object.assign({}, proposalParameters.current_fees);
                    }
                    if (proposalParameters.block_interval !== undefined) {
                        globalParameters.parameters.block_interval = proposalParameters.block_interval;
                    }
                    if (proposalParameters.maintenance_interval !== undefined) {
                        globalParameters.parameters.maintenance_interval = proposalParameters.maintenance_interval;
                    }
                    if (proposalParameters.maintenance_skip_slots !== undefined) {
                        globalParameters.parameters.maintenance_skip_slots = proposalParameters.maintenance_skip_slots;
                    }
                    if (proposalParameters.miner_proposal_review_period !== undefined) {
                        globalParameters.parameters.miner_proposal_review_period = proposalParameters.miner_proposal_review_period;
                    }
                    if (proposalParameters.maximum_transaction_size !== undefined) {
                        globalParameters.parameters.maximum_transaction_size = proposalParameters.maximum_transaction_size;
                    }
                    if (proposalParameters.maximum_block_size !== undefined) {
                        globalParameters.parameters.maximum_block_size = proposalParameters.maximum_block_size;
                    }
                    if (proposalParameters.maximum_time_until_expiration !== undefined) {
                        globalParameters.parameters.maximum_time_until_expiration = proposalParameters.maximum_time_until_expiration;
                    }
                    if (proposalParameters.maximum_proposal_lifetime !== undefined) {
                        globalParameters.parameters.maximum_proposal_lifetime = proposalParameters.maximum_proposal_lifetime;
                    }
                    if (proposalParameters.maximum_asset_feed_publishers !== undefined) {
                        globalParameters.parameters.maximum_asset_feed_publishers = proposalParameters.maximum_asset_feed_publishers;
                    }
                    if (proposalParameters.maximum_miner_count !== undefined) {
                        globalParameters.parameters.maximum_miner_count = proposalParameters.maximum_miner_count;
                    }
                    if (proposalParameters.maximum_authority_membership !== undefined) {
                        globalParameters.parameters.maximum_authority_membership = proposalParameters.maximum_authority_membership;
                    }
                    if (proposalParameters.cashback_vesting_period_seconds !== undefined) {
                        globalParameters.parameters.cashback_vesting_period_seconds = proposalParameters.cashback_vesting_period_seconds;
                    }
                    if (proposalParameters.cashback_vesting_threshold !== undefined) {
                        globalParameters.parameters.cashback_vesting_threshold = proposalParameters.cashback_vesting_threshold;
                    }
                    if (proposalParameters.max_predicate_opcode !== undefined) {
                        globalParameters.parameters.max_predicate_opcode = proposalParameters.max_predicate_opcode;
                    }
                    if (proposalParameters.max_authority_depth !== undefined) {
                        globalParameters.parameters.max_authority_depth = proposalParameters.max_authority_depth;
                    }
                    if (proposalParameters.extensions !== undefined) {
                        globalParameters.parameters.extensions = proposalParameters.extensions;
                    }

                    // console.log(globalParameters);
                    const operation = new Operations.MinerUpdateGlobalParameters(globalParameters);
                    const transaction = new Transaction();
                    transaction.add(operation);
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
                    reject(this.handleError(ProposalError.database_operation_failed, error));
                });
        }));
    }

    public proposeFeeChange(
        proposerAccountId: string, expiration: number, currentFeesParameters: CurrentFeesParameters, privateKey: string): Promise<boolean> {
        return new Promise<boolean>(((resolve, reject) => {
            const proposalParameters: ProposalParameters = {
                current_fees: currentFeesParameters
            };
            this.proposeParameterChange(proposerAccountId, expiration, proposalParameters, privateKey)
                .then(result => {
                    resolve(result);
                })
                .catch(error => {
                    reject(this.handleError(error));
                    return;
                });
        }));
    }

    public approveProposal(
        payingAccountId: string, proposalId: string, approvalDelta: DeltaParameters): Promise<boolean> {
        return new Promise<boolean>(((resolve, reject) => {

        }));
    }
}
