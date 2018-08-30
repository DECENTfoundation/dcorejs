/**
 * @module ApiModule
 */
import { DatabaseApi } from '../api/database';
import { ChainApi } from '../api/chain';
import { HistoryApi } from '../api/history';
import { MessagingApi } from '../api/messaging';
import { ApiConnector } from '../api/apiConnector';
import { TransactionBuilder } from '../transactionBuilder';
import { Operation } from '../model/transaction';

export interface ModuleApis {
    dbApi?: DatabaseApi;
    apiConnector?: ApiConnector;
    chainApi?: ChainApi;
    historyApi?: HistoryApi;
    messagingApi?: MessagingApi;
}

export class ApiModule {
    protected dbApi: DatabaseApi | null;
    protected chainApi: ChainApi | null;
    protected historyApi: HistoryApi | null;
    protected messagingApi: MessagingApi | null;
    protected apiConnector: ApiConnector | null;

    constructor(apis: ModuleApis) {
        this.dbApi = apis.dbApi || null;
        this.chainApi = apis.chainApi || null;
        this.historyApi = apis.historyApi || null;
        this.messagingApi = apis.messagingApi || null;
        this.apiConnector = apis.apiConnector || null;
    }

    protected handleError(message: string, err?: any): Error {
        const error = new Error(message);
        error.stack = err;
        return error;
    }

    protected finalizeAndBroadcast(transaction: TransactionBuilder, privateKey: string, broadcast: boolean): Promise<Operation> {
        return new Promise((resolve, reject) => {
                transaction.setTransactionFees()
                    .then(res => {
                        if (broadcast) {
                        transaction.broadcast(privateKey)
                            .then(res => resolve(transaction.operations[0]))
                            .catch(err => {
                                reject(this.handleError('transaction_broadcast_failed', err));
                            });
                        } else {
                            resolve(transaction.operations[0]);
                        }
                    })
                    .catch(err => {
                        reject(this.handleError('connection_failed', err));
                    });
        });
    }
}
