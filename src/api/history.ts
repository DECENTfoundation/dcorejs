import {ApiConnector} from './apiConnector';

enum HistoryError {
    error_executing_command = 'error_executing_command'
}

enum HistoryOperationName {
    getAccountHistory = 'get_account_history'
}

export class HistoryOperation {
    private _name: string;
    private _parameters: any[];

    get name(): string {
        return this._name;
    }

    get parameters(): any[] {
        return this._parameters;
    }

    constructor(name: string, ...params: any[]) {
        this._name = name;
        this._parameters = params;
    }
}

export namespace HistoryOperations {
    export class GetAccountHistory extends HistoryOperation {
        constructor(accountId: string, startObjectId: string = '1.7.0', endObjectId: string = '1.7.0', resultNumber: number = 100) {
            super(HistoryOperationName.getAccountHistory, accountId, startObjectId, resultNumber, endObjectId);
        }
    }
}

export class HistoryApi {
    private _api: any;
    private _apiConnector: ApiConnector;

    private histApi(): any {
        return this._api.instance().history_api();
    }

    constructor(api: any, apiConnector: ApiConnector) {
        this._api = api;
        this._apiConnector = apiConnector;
    }

    public execute(operation: HistoryOperation): Promise<any> {
        return new Promise((resolve, reject) => {
            this._apiConnector.connect().then(() => {
                this.histApi()
                    .exec(operation.name, operation.parameters)
                    .then((content: any) => resolve(content))
                    .catch((err: any) => {
                        reject(
                            this.handleError(HistoryError.error_executing_command, err)
                        );
                    });
            });
        });
    }

    private handleError(message: string, err: any): Error {
        const error = new Error(message);
        error.stack = err;
        return error;
    }
}
