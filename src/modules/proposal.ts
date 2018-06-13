import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {DeltaParameters, ProposalError, ProposalObject, ProposalParameters} from '../model/proposal';
import {DCoreAssetObject} from '../model/asset';


export class ProposalModule extends ApiModule {
    constructor(dbApi: DatabaseApi) {
        super(dbApi);
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
        proposerId: string, fromId: string, toId: string, amount: number, assetId: string, memoKey: string, expiration: number,
        privateKey: string): Promise<any> {
        return new Promise<any>(((resolve, reject) => {

            const assetOperation = new DatabaseOperations.GetAssets([assetId]);
            this.dbApi.execute(assetOperation)
                .then((assets: DCoreAssetObject[]) => {
                    if (assets[0] === null) {
                        reject(this.handleError(ProposalError.database_operation_failed));
                        return;
                    }
                    // const price = Asset.create(amount, assets[0]);
                    // const transferOperation = new Operations.TransferOperation(fromId, toId, price, memoKey);
                    //
                    // const operation = new Operations.ProposalCreate(proposerId, [transferOperation], expiration);
                    // const transaction = new Transaction();
                    // transaction.add(operation);
                    // transaction.propose({});
                    // transaction.broadcast(privateKey)
                    //     .then(result => {
                    //         resolve(result);
                    //     })
                    //     .catch(error => {
                    //         reject(this.handleError(ProposalError.transaction_broadcast_failed, error));
                    //     });

                })
                .catch(error => {
                    reject(this.handleError(ProposalError.database_operation_failed, error));
                });
        }));

    }

    public proposeParameterChange(
        proposingAccountId: string, expiration: number, proposalParameters: ProposalParameters): Promise<boolean> {
        return new Promise<boolean>(((resolve, reject) => {
        }));
    }

    public proposeFeeChange(
        proposingAccountId: string, expiration: number, proposalParameters: ProposalParameters): Promise<boolean> {
        return new Promise<boolean>(((resolve, reject) => {

        }));
    }

    public approveProposal(
        payingAccountId: string, proposalId: string, approvalDelta: DeltaParameters): Promise<boolean> {
        return new Promise<boolean>(((resolve, reject) => {

        }));
    }

}
