import {DatabaseApi} from '../api/database';

export class ApiModule {
    protected dbApi: DatabaseApi;
    constructor(dbApi: DatabaseApi) {
        this.dbApi = dbApi;
    }

    protected handleError(message: string, err?: any): Error {
        const error = new Error(message);
        error.stack = err;
        return error;
    }
}
