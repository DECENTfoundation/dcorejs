/**
 * @module MiningModule
 */
import { DatabaseApi } from '../api/database';
import { DatabaseOperations } from '../api/model/database';
import { Operations, Operation } from '../model/transaction';
import { Account, AccountError, Options } from '../model/account';
import { TransactionBuilder } from '../transactionBuilder';
import { ApiModule } from './ApiModule';
import { ApiConnector } from '../api/apiConnector';
import { ChainApi } from '../api/chain';
import { Block, Miner } from '../model/explorer';
import { MinerNameIdPair, MinerUpdateData, MiningError } from '../model/mining';
import VestingBalance = Block.VestingBalance;
import { ChainMethods } from '../api/model/chain';
import { Type } from '../model/types';
import { Validator } from './validator';

export class MiningModule extends ApiModule {
    static CHAIN_PROXY_TO_SELF = '';

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
            if (index >= 0) {
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
        super({
            dbApi,
            apiConnector,
            chainApi
        });
    }

    /**
     * Place vote for change of number of active miners.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#aeffdd3eb57a9f4877d660ca4ccd7d9f5
     *
     * @param {string} accountId            Id of account which placing vote, in format '1.2.X'. Example '1.2.345'.
     * @param {number} desiredNumOfMiners   Desired number of active miners in DCore network.
     * @param {string} privateKey           Private key to sign transaction.
     * @param {boolean} broadcast           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<boolean>}          Value confirming successful transaction broadcasting.
     */
    public setDesiredMinerCount(accountId: string, desiredNumOfMiners: number,
        privateKey: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [accountId, desiredNumOfMiners, privateKey, broadcast],
            [Type.string, Type.number, Type.string, Type.boolean])
        ) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return new Promise<Operation>((resolve, reject) => {
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
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(operation);
                    this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(err => reject(this.handleError(MiningError.database_fetch_failed, err)));
        });
    }

    /**
     * Create miner.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a71fd1099d86cf82f0c4a61f9a2d5803b
     *
     * @param {string} minerAccountId       Id of account which will be miner.
     * @param {string} URL                  URL to miner promotional web page.
     * @param {string} signingPublicKey     Public key used to signing mining operations.
     * @param {string} privateKey           Private key to sign transaction.
     * @param {boolean} broadcast           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}          Value confirming successful transaction broadcasting.
     */
    public createMiner(minerAccountId: string, URL: string,
        signingPublicKey: string, privateKey: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [minerAccountId, URL, signingPublicKey, privateKey, broadcast],
            [Type.string, Type.string, Type.string, Type.string, Type.boolean])
        ) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return new Promise<Operation>(((resolve, reject) => {
            this.apiConnector.connection()
                .then(res => {
                    const operation = new Operations.MinerCreate(minerAccountId, URL, signingPublicKey);
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(operation);
                    this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(err => reject(this.handleError(MiningError.connection_failed, err)));
        }));
    }

    /**
     * Remove your vote from selected miner.
     *
     * @param {string} miner            Miner to un-vote, in format '1.4.X'. Example '1.4.5'.
     * @param {string} account          Account id to un-vote miner from, in format '1.2.X'. Example '1.2.345'.
     * @param {string} privateKeyWif    Private key to sign thr transaction.
     * @param {boolean} broadcast       Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<boolean>}      Value confirming successful transaction broadcasting.
     */
    public unvoteMiner(miner: string, account: string, privateKeyWif: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(arguments, [Type.string, Type.string, Type.string])) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return this.unvoteMiners([miner], account, privateKeyWif, broadcast);
    }

    /**
     * Remove your votes from multiple miners.
     *
     * @param {string} miners           List of miners to un-vote, in format '1.4.X'. Example ['1.4.5', '1.4.6'].
     * @param {string} account          Account id to un-vote miner from, in format '1.2.X'. Example '1.2.345'.
     * @param {string} privateKeyWif    Private key to sign thr transaction.
     * @param {boolean} broadcast           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}      Value confirming successful transaction broadcasting.
     */
    public unvoteMiners(miners: string[], account: string, privateKeyWif: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [miners, account, privateKeyWif, broadcast],
            [[Array, Type.string], Type.string, Type.string, Type.boolean])
        ) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return new Promise<Operation>((resolve, reject) => {
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
                            const transaction = new TransactionBuilder();
                            transaction.addOperation(op);
                            this.finalizeAndBroadcast(transaction, privateKeyWif, broadcast)
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
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#ab0e2ae4331187fd07ad60cd090a4711f
     *
     * @param {string} miner            Miner to vote for, in format '1.4.X'. Example '1.4.5'.
     * @param {string} account          Account id to vote miner for, in format '1.2.X'. Example '1.2.345'.
     * @param {string} privateKeyWif    Private key to sign thr transaction.
     * @param {boolean} broadcast           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}      Value confirming successful transaction broadcasting.
     */
    public voteForMiner(miner: string, account: string, privateKeyWif: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [miner, account, privateKeyWif, broadcast],
            [Type.string, Type.string, Type.string, Type.boolean])
        ) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return this.voteForMiners([miner], account, privateKeyWif, broadcast);
    }

    /**
     * Add votes to multiple miners.
     * This method is also called on voteForMiner.
     *
     * @param {string} miners           List of miners to vote for, in format '1.4.X'. Example ['1.4.5', '1.4.6'].
     * @param {string} account          Account id to vote miner for, in format '1.2.X'. Example '1.2.345'.
     * @param {string} privateKeyWif    Private key to sign thr transaction.
     * @param {boolean} broadcast           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}      Value confirming successful transaction broadcasting.
     */
    public voteForMiners(miners: string[], account: string, privateKeyWif: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [miners, account, privateKeyWif, broadcast],
            [[Array, Type.string], Type.string, Type.string, Type.boolean])
        ) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return new Promise<Operation>((resolve, reject) => {
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
                            const transaction = new TransactionBuilder();
                            transaction.addOperation(op);
                            this.finalizeAndBroadcast(transaction, privateKeyWif, broadcast)
                                .then(res => resolve(res))
                                .catch(err => {
                                    if (process.env.ENVIRONMENT === 'DEV') {
                                        console.log(err);
                                    }
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

    /**
     * Bulk operation to vote and unvote miners in one operation. Use to avoid paying fee for multiple vote operation.
     *
     * @param {string[]} voteMiners     List of miners to vote for, in format '1.4.X'. Example ['1.4.5', '1.4.6'].
     * @param {string[]} unvoteMiners   List of miners to un-vote, in format '1.4.X'. Example ['1.4.5', '1.4.6'].
     * @param {string} accountId        Id of account vote changes will be made to, in format '1.2.X'. Example '1.2.345'.
     * @param {string} privateKey       Private key to sign the transaction.
     * @param {boolean} broadcast           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}      Value confirming successful transaction broadcasting.
     */
    public voteUnvoteMiners(voteMiners: string[], unvoteMiners: string[], accountId: string,
        privateKey: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [voteMiners, unvoteMiners, accountId, privateKey, broadcast],
            [[Array, Type.string], [Array, Type.string], Type.string, Type.string, Type.boolean])
        ) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return new Promise<Operation>((resolve, reject) => {
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
                            const transaction = new TransactionBuilder();
                            transaction.addOperation(accountUpdateOp);
                            this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                                .then(res => resolve(res))
                                .catch(err => reject(err));
                        })
                        .catch(err => reject(this.handleError(AccountError.database_operation_failed, err)));
                })
                .catch(err => reject(this.handleError(AccountError.account_fetch_failed, err)));
        });
    }

    /**
     * List balance for user in vesting.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a4e7c681a6c7996225c714f8dc6d061a8
     *
     * @param {string} accountId                    Account id of miner in format '1.2.X'. Example '1.2.345'.
     * @returns {Promise<Block.VestingBalance[]>}   VestingBalance object.
     */
    public getVestingBalances(accountId: string): Promise<VestingBalance[]> {
        if (!Validator.validateArguments(arguments, [Type.string])) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return new Promise<VestingBalance[]>((resolve, reject) => {
            const operation = new DatabaseOperations.GetVestingBalances(accountId);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(MiningError.database_fetch_failed, err)));
        });
    }

    /**
     * Update info in miner account.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a4d94757da6cc355932fa01a0302e9007
     *
     * @param {string} minerId                  Miner id in format '1.4.X'. Example '1.4.56'.
     * @param {string} minerAccountId           Account id of miner in format '1.2.X'. Example '1.2.345'.
     * @param {MinerUpdateData} updateData      Information to be changed in miner account.
     * @param {string} privateKey               Miner's private key to sign the transaction.
     * @param {boolean} broadcast           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}              Value confirming successful transaction broadcasting.
     */
    public updateMiner(minerId: string, minerAccountId: string, updateData: MinerUpdateData,
        privateKey: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [minerId, minerAccountId, updateData, privateKey, broadcast],
            [Type.string, Type.string, MinerUpdateData, Type.string, Type.boolean])
        ) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return new Promise<Operation>((resolve, reject) => {
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
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(operation);
                    this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(err => reject(this.handleError(MiningError.miner_does_not_exist, err)));

        });
    }

    /**
     * Withdraw amount from vesting for account.
     * NOTE: 24h after amount is vested
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#abb116624419b0f7142d725150561534a
     *
     * @param {string} vestinBalanceId      Vesting balance id in format '1.9.X'. Example '1.9.345'.
     * @param {string} ownerId              Vesting balance owner account id in format '1.2.X'. Example '1.2.345'.
     * @param {number} amount               Amount of balance to be withdrawn.
     * @param {string} assetId              Asset id of amount to be withdrawn.
     * @param {string} privateKey           Owner's private key to sign the transaction.
     * @param {boolean} broadcast           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}          Value confirming successful transaction broadcasting.
     */
    public withdrawVesting(
        vestinBalanceId: string,
        ownerId: string,
        amount: number,
        assetId: string,
        privateKey: string,
        broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [vestinBalanceId, ownerId, amount, assetId, privateKey, broadcast],
            [Type.string, Type.string, Type.number, Type.string, Type.string, Type.boolean])
        ) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return new Promise<Operation>((resolve, reject) => {
            const operation = new Operations.VestingBalanceWithdraw(
                vestinBalanceId,
                ownerId,
                {
                    amount: amount,
                    asset_id: assetId
                }
            );
            const transaction = new TransactionBuilder();
            transaction.addOperation(operation);
            this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    /**
     * Account what is selected as proxy, his votes is taken as yours.
     * Automatically vote for same miners as voting proxy account voted, with your balance.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a9c571d810992f8a72142ace75e74eceb
     *
     * @param {string} accountId            Account if in format '1.2.X'. Example '1.2.345'.
     * @param {string} votingAccountId      Id of account to be set as voting proxy, in format '1.2.X'.
     *                                      Set to '' for default setting. Example '1.2.345'.
     * @param {string} privateKey           Private used to sign transaction.
     * @param {boolean} broadcast           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}          Value confirming successful transaction broadcasting.
     */
    public setVotingProxy(accountId: string, votingAccountId: string, privateKey: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [accountId, votingAccountId, privateKey, broadcast],
            [Type.string, Type.string, Type.string, Type.boolean])
        ) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return new Promise<Operation>((resolve, reject) => {
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
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(accountUpdateOperation);
                    this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(err => this.handleError(MiningError.account_fetch_failed, err));
        });
    }

    /**
     * List miners in DCore network.
     * https://docs.decent.ch/developer/group___wallet_a_p_i___mining.html#gadd09ed33a90485888d6d885ddaa82fcd
     *
     * @param {string} fromId                   Miner id to start list from, in format '1.4.X'. Example '1.4.56',
     *                                          Use '0.0.0' to list from the beginning.
     * @param {number} limit                    Size of result list. Default 100(Max)
     * @returns {Promise<MinerNameIdPair[]>}    List of MinerNameIdPair.
     */
    public listMiners(fromId: string, limit: number = 100): Promise<MinerNameIdPair[]> {
        if (!Validator.validateArguments([fromId, limit], [Type.string, Type.number])) {
            throw new TypeError(MiningError.invalid_arguments);
        }
        return new Promise<MinerNameIdPair[]>(((resolve, reject) => {
            const operation = new DatabaseOperations.LookupMiners(fromId, limit);
            this.dbApi.execute(operation)
                .then((miners: MinerNameIdPair[]) => {
                    resolve(miners);
                })
                .catch(err => reject(this.handleError(MiningError.database_fetch_failed, err)));
        }));
    }

    /**
     * Get miner object.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a43b1380512f11c9f6963ce2a5c9c81c9
     *
     * @param {string} minerId      Miner id to be fetched, in format '1.4.X'. Example '1.4.56'.
     * @returns {Promise<Miner>}    Miner object.
     */
    public getMiner(minerId: string): Promise<Miner> {
        if (!Validator.validateArguments(arguments, [Type.string])) {
            throw new TypeError(MiningError.invalid_arguments);
        }
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
