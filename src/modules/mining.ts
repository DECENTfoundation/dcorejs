import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {Operations} from '../model/transaction';
import {Account, AccountError, Options} from '../model/account';
import {Transaction} from '../transaction';
import {ApiModule} from './ApiModule';
import {ApiConnector} from '../api/apiConnector';
import {ChainApi} from '../api/chain';
import {Block, Miner} from '../model/explorer';
import {MinerNameIdPair, MinerUpdateData, MiningError} from '../model/mining';
import VestingBalance = Block.VestingBalance;
import {ChainMethods} from '../api/model/chain';

export class MiningModule extends ApiModule {
    static CHAIN_PROXY_TO_SELF = '';
    private connector: ApiConnector;
    private chainApi: ChainApi;

    private static getSortedMiners(minersVoteIds: string[]): string[] {
        const res = [].concat(...minersVoteIds);
        res.sort((e1: string, e2: string) => {
            return Number(e1.split(':')[1]) - Number(e2.split(':')[1]);
        });
        return res;
    }

    private static removeVotedMiners(voted: string[], toUnvote: string[]): string[] {
        const res: string[] = [].concat(...voted);
        toUnvote.forEach(u => {
            const index = res.indexOf(u);
            if (index > 0) {
                res.splice(index, 1);
            }
        });
        return res;
    }

    private static createVoteIdList(ids: string[], objects: any[]): string[] {
        const res: string[] = [];
        ids.forEach(m => {
            const miner = objects.find(el => el.id === m);
            res.push(miner.vote_id);
        });
        return res;
    }

    constructor(dbApi: DatabaseApi, apiConnector: ApiConnector, chainApi: ChainApi) {
        super(dbApi);
        this.connector = apiConnector;
        this.chainApi = chainApi;
    }

    /**
     * Place vote for change of number of active miners.
     *
     * More details https://docs.decent.ch/UseCases/#proposal_to_change_the_count_of_voted_miners
     *
     * @param {string} accountId
     * @param {number} desiredNumOfMiners
     * @param {string} privateKey
     * @returns {Promise<any>}
     */
    public setDesiredMinerCount(accountId: string, desiredNumOfMiners: number, privateKey: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            if (!accountId || desiredNumOfMiners === undefined || !privateKey) {
                reject('missing_parameter');
                return;
            }
            const operation = new DatabaseOperations.GetAccounts([accountId]);
            this.dbApi.execute(operation)
                .then((accounts: Account[]) => {
                    if (!accounts || accounts.length === 0) {
                        reject('account_not_found');
                        return;
                    }
                    const account = accounts[0];
                    if (account.options.votes.length < desiredNumOfMiners) {
                        reject(this.handleError(
                            'unable_to_place_vote',
                            'Number of desired miners cannot be higher than number of voted miners.'
                        ));
                        return;
                    }
                    const options: Options = account.options;
                    options.num_miner = desiredNumOfMiners;
                    const operation = new Operations.AccountUpdateOperation(
                        accountId, account.owner, account.active, options, {}
                    );
                    const transaction = new Transaction();
                    transaction.addOperation(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(true))
                        .catch(err => reject(this.handleError(MiningError.transaction_broadcast_failed, err)));
                })
                .catch(err => reject(this.handleError(MiningError.database_fetch_failed, err)));
        });
    }

    public createMiner(minerAccountId: string, URL: string, signingPublicKey: string, privateKey: string): Promise<boolean> {
        return new Promise<boolean>(((resolve, reject) => {
            this.connector.connect()
                .then(res => {
                    const operation = new Operations.MinerCreate(minerAccountId, URL, signingPublicKey);
                    const transaction = new Transaction();
                    transaction.addOperation(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(true))
                        .catch(err => reject(this.handleError(MiningError.transaction_broadcast_failed, err)));
                })
                .catch(err => reject(this.handleError(MiningError.connection_failed, err)));
        }));
    }

    /**
     * Remove your vote from selected miner.
     *
     * @param {string} miner
     * @param {string} account
     * @param {string} privateKeyWif
     * @returns {Promise<any>}
     */
    public unvoteMiner(miner: string, account: string, privateKeyWif: string): Promise<boolean> {
        return this.unvoteMiners([miner], account, privateKeyWif);
    }

    /**
     * Remove your votes from multiple miners.
     * This method is also called on unvoteMiner.
     *
     * @param {string} miner
     * @param {string} account
     * @param {string} privateKeyWif
     * @returns {Promise<any>}
     */
    public unvoteMiners(miners: string[], account: string, privateKeyWif: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.chainApi.fetch(new ChainMethods.GetAccount(account))
                .then(res => {
                    const [voterAccount] = res;
                    const voter: Account = JSON.parse(JSON.stringify(voterAccount));
                    const operation = new DatabaseOperations.GetMiners(miners);
                    this.dbApi.execute(operation)
                        .then((res: Miner[]) => {
                            res.forEach(miner => {
                                const voteIndex = voter.options.votes.indexOf(miner.vote_id);
                                voter.options.votes.splice(voteIndex, 1);
                            });
                            if (voter.options.votes.length < voter.options.num_miner) {
                                reject(
                                    this.handleError(
                                        AccountError.cannot_update_miner_votes,
                                        'Number of votes cannot be lower as desired miners number'
                                    )
                                );
                                return;
                            }
                            const op = new Operations.AccountUpdateOperation(
                                account,
                                voter.owner,
                                voter.active,
                                voter.options,
                                {}
                            );
                            const transaction = new Transaction();
                            transaction.addOperation(op);
                            transaction.broadcast(privateKeyWif)
                                .then(res => resolve(true))
                                .catch(err => reject(err));
                        })
                        .catch(err => reject(this.handleError(AccountError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(AccountError.account_fetch_failed, err)));
        });
    }

    /**
     * Vote for selected miner.
     * More information on https://devdocs.decent.ch/UseCases/#vote_for_a_miner_1
     *
     * @param {string} miner
     * @param {string} account
     * @param {string} privateKeyWif
     * @returns {Promise<any>}
     */
    public voteForMiner(miner: string, account: string, privateKeyWif: string): Promise<any> {
        return this.voteForMiners([miner], account, privateKeyWif);
    }

    /**
     * Add votes to multiple miners.
     * This method is also called on voteForMiner.
     *
     * @param {string[]} miners
     * @param {string} account
     * @param {string} privateKeyWif
     * @returns {Promise<any>}
     */
    public voteForMiners(miners: string[], account: string, privateKeyWif: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.chainApi.fetch(new ChainMethods.GetAccount(account))
                .then(res => {
                    const [voterAccount] = res;
                    const voter: Account = JSON.parse(JSON.stringify(voterAccount));
                    const operation = new DatabaseOperations.GetMiners(miners);
                    this.dbApi.execute(operation)
                        .then((res: Miner[]) => {
                            voter.options.votes.push(...res.map(miner => miner.vote_id));
                            voter.options.votes.sort((e1: string, e2: string) => {
                                return Number(e1.split(':')[1]) - Number(e2.split(':')[1]);
                            });
                            const op = new Operations.AccountUpdateOperation(
                                account,
                                voter.owner,
                                voter.active,
                                voter.options,
                                {}
                            );
                            const transaction = new Transaction();
                            transaction.addOperation(op);
                            transaction.broadcast(privateKeyWif)
                                .then(res => resolve(true))
                                .catch((err: Error) => {
                                    console.log(err);
                                    let errorMessage = 'transaction_broadcast_failed';
                                    if (err.stack.indexOf('duplicate') >= 0) {
                                        errorMessage = 'duplicate_parameter_set';
                                    }
                                    reject(errorMessage);
                                });
                        })
                        .catch(err => reject(this.handleError(AccountError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(AccountError.account_fetch_failed, err)));
        });
    }

    public voteUnvoteMiners(voteMiners: string[], unvoteMiners: string[], accountId: string, privateKey: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.chainApi.fetch(new ChainMethods.GetAccount(accountId))
                .then(res => {
                    if (!res[0]) {
                        reject(this.handleError(AccountError.account_does_not_exist, ''));
                        return;
                    }
                    const [voterAcc] = res;
                    const voter: Account = JSON.parse(JSON.stringify(voterAcc));

                    const miners = [].concat(...voteMiners, ...unvoteMiners);
                    const operation = new DatabaseOperations.GetMiners(miners);
                    this.dbApi.execute(operation)
                        .then((res: any[]) => {
                            const minersToVote: string[] = MiningModule.createVoteIdList(voteMiners, res);
                            const minersToUnvote: string[] = MiningModule.createVoteIdList(unvoteMiners, res);

                            const finalMiners = MiningModule.removeVotedMiners(voter.options.votes, minersToUnvote);
                            finalMiners.push(...minersToVote);
                            if (finalMiners.length < voter.options.num_miner) {
                                reject(
                                    this.handleError(
                                        AccountError.cannot_update_miner_votes,
                                        'Number of votes cannot be lower as desired miners number'
                                    )
                                );
                                return;
                            }
                            const newOptions = Object.assign({}, voter.options);
                            newOptions.votes = MiningModule.getSortedMiners(finalMiners);
                            const accountUpdateOp = new Operations.AccountUpdateOperation(
                                accountId,
                                voter.owner,
                                voter.active,
                                newOptions,
                                {}
                            );
                            const transaction = new Transaction();
                            transaction.addOperation(accountUpdateOp);
                            transaction.broadcast(privateKey)
                                .then(res => resolve(true))
                                .catch(err => reject(this.handleError(AccountError.transaction_broadcast_failed, err)));
                        })
                        .catch(err => reject(this.handleError(AccountError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(AccountError.account_fetch_failed, err)));
        });
    }

    public getVestingBalances(accountId: string): Promise<VestingBalance[]> {
        return new Promise<VestingBalance[]>((resolve, reject) => {
            const operation = new DatabaseOperations.GetVestingBalances(accountId);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(MiningError.database_fetch_failed, err)));
        });
    }

    public updateMiner(minerId: string, minerAccountId: string, updateData: MinerUpdateData, privateKey: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const getMinerOp = new DatabaseOperations.GetMiners([minerId]);
            this.dbApi.execute(getMinerOp)
                .then(miners => {
                    if (!miners || miners.length === 0) {
                        reject(this.handleError(MiningError.miner_does_not_exist, ''));
                        return;
                    }
                    const miner: Miner = miners[0];
                    const operation = new Operations.MinerUpdate(
                        minerId,
                        minerAccountId,
                        updateData.newUrl || miner.url,
                        updateData.newSigningKey || miner.signing_key
                    );
                    const transaction = new Transaction();
                    transaction.addOperation(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(true))
                        .catch(err => reject(this.handleError(MiningError.database_fetch_failed, err)));
                })
                .catch(err => reject(this.handleError(MiningError.miner_does_not_exist, err)));

        });
    }

    public withdrawVesting(
        vestinBalanceId: string,
        ownerId: string,
        amount: number,
        assetId: string,
        privateKey: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const operation = new Operations.VestingBalanceWithdraw(
                vestinBalanceId,
                ownerId,
                {
                    amount: amount,
                    asset_id: assetId
                }
            );
            const transaction = new Transaction();
            transaction.addOperation(operation);
            transaction.broadcast(privateKey)
                .then(res => resolve(true))
                .catch(err => reject(this.handleError(MiningError.transaction_broadcast_failed, err)));
        });
    }

    public setVotingProxy(accountId: string, votingAccountId: string = '', privateKey: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.chainApi.fetch(new ChainMethods.GetAccount(accountId))
                .then((result: Account[]) => {
                    if (result.length === 0 || !result[0]) {
                        reject(this.handleError(MiningError.account_fetch_failed));
                        return;
                    }
                    const account = result[0];
                    const newOptions = Object.assign({}, account.options);
                    if (votingAccountId !== '') {
                        if (newOptions.voting_account === votingAccountId) {
                            reject(this.handleError(MiningError.duplicate_settings, 'Voting account already set'));
                            return;
                        }
                    } else {
                        if (newOptions.voting_account === MiningModule.CHAIN_PROXY_TO_SELF) {
                            reject(this.handleError(MiningError.duplicate_settings, 'Voting account already set'));
                            return;
                        }
                        newOptions.voting_account = MiningModule.CHAIN_PROXY_TO_SELF;
                    }
                    const accountUpdateOperation = new Operations.AccountUpdateOperation(
                        accountId,
                        account.owner,
                        account.active,
                        newOptions,
                        {}
                    );
                    const transaction = new Transaction();
                    transaction.addOperation(accountUpdateOperation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(true))
                        .catch(err => reject(this.handleError(MiningError.transaction_broadcast_failed, err)));
                })
                .catch(err => this.handleError(MiningError.account_fetch_failed, err));
        });
    }
    public listMiners(fromId: string, limit: number = 100): Promise<MinerNameIdPair[]> {
        return new Promise<MinerNameIdPair[]>(((resolve, reject) => {
            const operation = new DatabaseOperations.LookupMiners(fromId, limit);
            this.dbApi.execute(operation)
                .then((miners: MinerNameIdPair[]) => {
                    resolve(miners);
                })
                .catch(err => reject(this.handleError(MiningError.database_fetch_failed, err)));
        }));
    }

    public getMiner(minerId: string): Promise<Miner> {
        return new Promise<Miner>((resolve, reject) => {
            const operation = new DatabaseOperations.GetMiners([minerId]);
            this.dbApi.execute(operation)
                .then((miners: Miner[]) => {
                    if (!miners || !miners[0]) {
                        reject(this.handleError(MiningError.miner_does_not_exist));
                        return;
                    }
                    resolve(miners[0]);
                })
                .catch(err => reject(this.handleError(MiningError.database_fetch_failed, err)));
        });
    }
}
