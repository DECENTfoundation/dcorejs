import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {Operations} from '../model/transaction';
import {Options} from '../model/account';
import {Transaction} from '../transaction';
import {ApiModule} from './ApiModule';
import {Account} from '../model/account';
import { Utils } from '../utils';

export class MiningModule extends ApiModule {
    constructor(dbApi: DatabaseApi) {
        super(dbApi);
    }

    public setDesiredMinerCount(accountId: string, desiredNumOfMiners: number, privateKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const operation = new DatabaseOperations.GetAccounts([accountId]);
            this.dbApi.execute(operation)
                .then((accounts: Account[]) => {
                    if (!accounts || accounts.length === 0) {
                        reject('account_not_found');
                        return;
                    }
                    const account = accounts[0];
                    const options: Options = account.options;
                    // options.num_witness = desiredNumOfMiners;
                    options.num_miner = desiredNumOfMiners;
                    delete options.num_witness;
                    const operation =  new Operations.AccountUpdateOperation(
                        accountId, account.owner, account.active, options, {}
                    );
                    const transaction = new Transaction();
                    transaction.add(operation);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(res))
                        .catch(err => reject(this.handleError('transaction_broadcast_failed', err)));
                })
                .catch(err => reject('database_fetch_failed'));
        });
    }

    public createMiner(minerAccountId: string, proposalURL: string, privateKey: string): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            const publicKey = Utils.getPublicKey(Utils.privateKeyFromWif(privateKey));
            const operation = new Operations.MinerCreate(minerAccountId, proposalURL, publicKey.stringKey);
            const transaction = new Transaction();
            transaction.add(operation);
            transaction.broadcast(privateKey)
                .then(res => resolve(transaction))
                .catch(err => reject(this.handleError('transaction_broadcast_failed', err)));
        });
    }

    public updateMiner(): Promise<any> {
        return new Promise<any>((resolve, reject) => {
            
        });
    }
}
