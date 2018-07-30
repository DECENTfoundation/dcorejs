/**
 * @module ApiModule
 */
import { DatabaseApi } from '../api/database';
import { ChainApi } from '../api/chain';
import { HistoryApi } from '../api/history';
import { MessagingApi } from '../api/messaging';
import { ApiConnector } from '../api/apiConnector';
import { BaseObject } from './BaseObject';

export interface ModuleApis {
    dbApi?: DatabaseApi;
    apiConnector?: ApiConnector;
    chainApi?: ChainApi;
    historyApi?: HistoryApi;
    messagingApi?: MessagingApi;
}

export class ApiModule extends BaseObject {
    protected dbApi: DatabaseApi | null;
    protected chainApi: ChainApi | null;
    protected historyApi: HistoryApi | null;
    protected messagingApi: MessagingApi | null;
    protected apiConnector: ApiConnector | null;

    constructor(apis: ModuleApis) {
        super();
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
}
