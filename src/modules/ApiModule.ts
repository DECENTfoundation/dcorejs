/**
 * @module ApiModule
 */
import {DatabaseApi} from '../api/database';
import {ChainApi} from '../api/chain';
import {HistoryApi} from '../api/history';
import {MessagingApi} from '../api/messaging';
import {ApiConnector} from '../api/apiConnector';

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

    protected validateObject<T>(object: T | any, typeContructor: {new (): T}): boolean {
        const t = new typeContructor();
        let isValid = true;
        if (typeof object !== 'object') {
            return false;
        }
        Object.keys(t).forEach(key => {
            if (t[key] !== null && typeof t[key] !== typeof object[key]) {
                if (isValid) {
                    isValid = false;
                }
            }
        });
        return isValid;
    }
}
