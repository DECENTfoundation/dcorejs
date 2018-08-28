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

    constructor(apiAddresses: string[],
        api: any,
        testConnectionQuality: boolean = true,
        connectionStatusCallback: (status: ConnectionState) => void = null) {
        this._apiAddresses = apiAddresses;
        this.initConnetion(apiAddresses, api, testConnectionQuality, connectionStatusCallback);
    }

    private initConnetion(addresses: string[],
        api: any,
        testConnectionQuality: boolean = true,
        connectionStatusCallback: (status: ConnectionState) => void = null): void {
        api.setRpcConnectionStatusCallback((status: string) => this.handleConnectionState(status, connectionStatusCallback));
        this._connectionPromise = this.connectApi(api, testConnectionQuality);
    }

    private async connectApi(api: any, testConnectionQuality: boolean): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            let addresses: string[] = this._apiAddresses;
            if (testConnectionQuality) {
                const conTestResults = await this.testConnectionTime(this._apiAddresses);
                addresses = conTestResults
                    .sort((a, b) => a.elapsedTime - b.elapsedTime)
                    .map(r => r.address);
            }

            for (let i = 0; i < addresses.length; i += 1) {
                const address = ['wss', ...addresses[i].split(':').slice(1)].join(':');
                try {
                    const res = await this.getConnectionPromise(address, api);
                    if (process.env.ENVIRONMENT === 'DEV') {
                        console.log('debug => Connected to', address);
                    }
                    resolve(res);
                    return;
                } catch (e) {
                    if (process.env.ENVIRONMENT === 'DEV') {
                        console.log('debug => Fail to connect to', address);
                    }
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
                        elapsedTime: Infinity,
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
