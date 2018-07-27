/**
 * @module DatabaseApi
 */
import {ApiConnector} from './apiConnector';
import {DatabaseError, DatabaseOperation} from './model/database';

export class ConnectionStatus {
    static open = 'open';
}

export class DatabaseApi {
    protected _api: any;
    private _apiConnector: ApiConnector;

    private dbApi(): any {
        return this._api.instance().db_api();
    }

    constructor(api: any, apiConnector: ApiConnector) {
        this._api = api;
        this._apiConnector = apiConnector;
    }

    public execute<T = any>(operation: DatabaseOperation): Promise<T> {
        return new Promise((resolve, reject) => {
            this._apiConnector.connection()
                .then(() => {
                    this.dbApi()
                        .exec(operation.name, operation.parameters)
                        .then((content: any) => resolve(content))
                        .catch((err: any) => {
                            reject(
                                this.handleError(DatabaseError.database_execution_failed, err)
                            );
                        });
                })
                .catch(err => {
                    reject(this.handleError(DatabaseError.api_connection_failed, err));
                });
        });
    }

    private handleError(databaseErrorMessage: DatabaseError, err: any): Error {
        const error = new Error(databaseErrorMessage);
        error.stack = err;
        return error;
    }
}
