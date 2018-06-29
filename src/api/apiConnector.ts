// const BBPromise = require('bluebird');
// import * as request from 'request';
import axios from 'axios';

interface ConnectionTestResult {
    address: string;
    elapsedTime: number;
    success: boolean;
}

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

    private async connectApi(api: any): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            const conTestResults = await this.testConnectionTime(this._apiAddresses);
            const addresses = conTestResults
                .filter(r => r.success)
                .sort((a, b) => a.elapsedTime - b.elapsedTime)
                .map(r => r.address);

            for (let i = 0; i < addresses.length; i += 1) {
                const address = ['wss', ...addresses[i].split(':').slice(1)].join(':');
                try {
                    const res = await this.getConnectionPromise(address, api);
                    resolve(res);
                    return;
                } catch (e) {
                    api.close();
                }
            }
            reject(this.handleError(ApiConnectorError.ws_connection_failed));
        });
    }

    private testConnectionTime(addresses: string[]): Promise<ConnectionTestResult[]> {
        const httpAddrses = addresses.map(address => {
            return ['https', ...address.split(':').slice(1)].join(':');
        });

        const promises = httpAddrses.map((httpAddress: string) => {
            return new Promise<ConnectionTestResult>((async resolve => {
                const refTime = new Date();
                try {
                    await axios.get(httpAddress);
                    const time = new Date();
                    resolve({
                        address: httpAddress,
                        elapsedTime: time.getTime() - refTime.getTime(),
                        success: true
                    });
                } catch (e) {
                    resolve({
                        address: httpAddress,
                        elapsedTime: 0,
                        success: false
                    });
                }
            }));
        });
        return Promise.all(promises);
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
