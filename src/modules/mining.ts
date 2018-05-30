import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {Operations} from '../model/transaction';
import {AccountError, Options} from '../model/account';
import {Transaction} from '../transaction';
import {ApiModule} from './ApiModule';
import {Account} from '../model/account';
import {ApiConnector} from '../api/apiConnector';
import {ChainApi, ChainMethods} from '../api/chain';
import {Block, Miner} from '../model/explorer';
import VestingBalance = Block.VestingBalance;

export enum MiningError {
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    database_fetch_failed = 'database_fetch_failed',
    connection_failed = 'connection_failed'
}

export class MiningModule extends ApiModule {
    private connector: ApiConnector;
    private chainApi: ChainApi;

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
    public setDesiredMinerCount(accountId: string, desiredNumOfMiners: number, privateKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
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
                    transaction.add(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(res))
                        .catch(err => reject(this.handleError(MiningError.transaction_broadcast_failed, err)));
                })
                .catch(err => reject(this.handleError(MiningError.database_fetch_failed, err)));
        });
    }

    public createMiner(minerAccountId: string, URL: string, signingPublicKey: string, privateKey: string): Promise<any> {
        return new Promise<any>(((resolve, reject) => {
            this.connector.connect()
                .then(res => {
                    const operation = new Operations.MinerCreate(minerAccountId, URL, signingPublicKey);
                    const transaction = new Transaction();
                    transaction.add(operation);
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
    public unvoteMiner(miner: string, account: string, privateKeyWif: string): Promise<any> {
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
    public unvoteMiners(miners: string[], account: string, privateKeyWif: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const operations = new ChainMethods();
            operations.add(ChainMethods.getAccount, account);
            this.chainApi.fetch(operations)
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
                            transaction.add(op);
                            transaction.broadcast(privateKeyWif)
                                .then(res => resolve(res))
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
    public voteForMiners(miners: string[], account: string, privateKeyWif: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const operations = new ChainMethods();
            operations.add(ChainMethods.getAccount, account);
            this.chainApi.fetch(operations)
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
                            transaction.add(op);
                            transaction.broadcast(privateKeyWif)
                                .then(res => resolve(transaction))
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

    public getVestingBalances(accountId: string): Promise<VestingBalance[]> {
        return new Promise<VestingBalance[]>((resolve, reject) => {
            const operation = new DatabaseOperations.GetVestingBalances(accountId);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(MiningError.database_fetch_failed, err)));
        });
    }
}
