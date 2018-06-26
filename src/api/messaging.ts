import {ApiConnector} from './apiConnector';
import {MessagingError, MessagingOperation} from './model/messaging';

export class MessagingApi {
    protected _api: any;
    private _apiConnector: ApiConnector;

    private msgApi(): any {
        return this._api.instance().msg_api();
    }

    constructor(api: any, apiConnector: ApiConnector) {
        this._api = api;
        this._apiConnector = apiConnector;
    }

    public execute<T = any>(operation: MessagingOperation): Promise<T> {
        return new Promise((resolve, reject) => {
            this._apiConnector.connect()
                .then(() => {
                    this.msgApi()
                        .exec(operation.name, operation.parameters)
                        .then((content: any) => resolve(content))
                        .catch((err: any) => {
                            reject(
                                this.handleError(MessagingError.query_execution_failed, err)
                            );
                        });
                })
                .catch(err => {
                    reject(this.handleError(MessagingError.api_connection_failed, err));
                });
        });
    }

    private handleError(databaseErrorMessage: MessagingError, err: any): Error {
        const error = new Error(databaseErrorMessage);
        error.stack = err;
        return error;
    }
}
