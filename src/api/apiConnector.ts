const BBPromise = require('bluebird');

export enum ApiConnectorError {
    ws_connection_failed = 'ws_connection_failed'
}

export enum ConnectionState {
    open = 'open',
    closed = 'closed',
    reconnect = 'reconnect',
    error = 'error',
    unknown = 'unknown'
}

/**
 * ApiConnector provide connection to dcorejs-lib apis
 *
 * @export
 * @class ApiConnector
 */
export class ApiConnector {
    private _connectionPromise: Promise<any>;

    constructor(apiAddresses: string[], api: any, connectionStatusCallback: (status: ConnectionState) => void = null) {
        this.initConnetion(apiAddresses, api, connectionStatusCallback);
    }

    private initConnetion(addresses: string[], api: any, connectionStatusCallback: (status: ConnectionState) => void = null): void {
        api.setRpcConnectionStatusCallback((status: string) => this.handleConnectionState(status, connectionStatusCallback));
        const promises: Promise<any>[] = [];
        addresses.forEach(address => {
            promises.push(this.getConnectionPromise(address, api));
        });

        this._connectionPromise = new Promise((resolve, reject) => {
            BBPromise.any(promises)
                .then((result) => {
                    resolve(result);
                })
                .catch(err => {
                    reject(this.handleError(ApiConnectorError.ws_connection_failed, err));
                });
        });
    }

    private getConnectionPromise(forAddress: string, api: any): Promise<any> {
        return api.instance(forAddress, true).init_promise;
    }

    public connect(): Promise<void> {
        return this._connectionPromise;
    }

    private handleConnectionState(state: string, callback: (status: ConnectionState) => void): void {
        if (callback === null) {
            return;
        }
        let connectionState: ConnectionState;
        switch (state) {
            case 'open':
                connectionState = ConnectionState.open;
                break;
            case 'reconnect':
                connectionState = ConnectionState.reconnect;
                break;
            case 'error':
                connectionState = ConnectionState.error;
                break;
            case 'closed':
                connectionState = ConnectionState.closed;
                break;
            default:
                connectionState = ConnectionState.unknown;
                break;
        }
        callback(connectionState);
    }

    private handleError(message: string, err: any): Error {
        const error = new Error(message);
        error.stack = err;
        return error;
    }
}
