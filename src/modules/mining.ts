import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {Operations} from '../model/transaction';
import {AccountError, Options} from '../model/account';
import {Transaction} from '../transaction';
import {ApiModule} from './ApiModule';
import {Account} from '../model/account';
import {ApiConnector} from '../api/apiConnector';
import {ChainApi, ChainMethods} from '../api/chain';
import {Miner} from '../model/explorer';

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
                })
                .catch(err => reject('database_fetch_failed'));
        });
    }
}
