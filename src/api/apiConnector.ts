// const BBPromise = require('bluebird');

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
    private _apiAddresses: string[];

    public get apiAddresses(): string[] {
        return this._apiAddresses;
    }

    constructor(apiAddresses: string[], api: any, connectionStatusCallback: (status: ConnectionState) => void = null) {
        this._apiAddresses = apiAddresses;
        this.initConnetion(apiAddresses, api, connectionStatusCallback);
    }

    private initConnetion(addresses: string[], api: any, connectionStatusCallback: (status: ConnectionState) => void = null): void {
        api.setRpcConnectionStatusCallback((status: string) => this.handleConnectionState(status, connectionStatusCallback));
        this._connectionPromise = this.connectApi(api);
    }

    private connectApi(api: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            for (let i = 0; i < this._apiAddresses.length; i += 1) {
                const address = this._apiAddresses[i];
                try {
                    const res = await this.getConnectionPromise(address, api);
                    console.log('Connected to - ', address);
                    resolve(res);
                    return;
                } catch (e) {
                    console.log('Error connecting - ', address);
                    api.close();
                }
            }
            reject(this.handleError(ApiConnectorError.ws_connection_failed));
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

    private handleError(message: string, err: any = ''): Error {
        const error = new Error(message);
        error.stack = err;
        return error;
    }
}
