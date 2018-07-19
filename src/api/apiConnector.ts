/**
 * @module ApiConnector
 */
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
    private readonly _apiAddresses: string[];
    private readonly _api: any;
    private _isConnected = false;
    private connectedAddress: string = null;
    private testConnectionQuality: boolean;
    private connectionStatusCallback: (status: ConnectionState) => void;

    public get isConnected(): boolean {
        return this._isConnected;
    }

    public get apiAddresses(): string[] {
        return this._apiAddresses;
    }

    constructor(apiAddresses: string[],
                api: any,
                testConnectionQuality: boolean = true,
                connectionStatusCallback: (status: ConnectionState) => void = null) {
        this._apiAddresses = apiAddresses;
        this._api = api;
        this.connectionStatusCallback = connectionStatusCallback;
        this.testConnectionQuality = testConnectionQuality;
        this.initConnetion(apiAddresses, api, testConnectionQuality, connectionStatusCallback);
    }

    /**
     * Create new connection to WS interface of daemon with addresses.
     *
     * @param {string[]} addresses
     * @param api
     * @param {boolean} testConnectionQuality
     * @param {(status: ConnectionState) => void} connectionStatusCallback
     */
    private initConnetion(addresses: string[],
                          api: any,
                          testConnectionQuality: boolean = true,
                          connectionStatusCallback: (status: ConnectionState) => void = null): void {
        api.setRpcConnectionStatusCallback((status: string) => this.handleConnectionState(status, connectionStatusCallback));
        this._connectionPromise = this.connectApi(addresses, api, testConnectionQuality);
    }

    /**
     * Connect DCore network daemon api using dcorejs-lib.
     *
     * @param {string[]} addresses              Addresses to connect to.
     * @param api                               Dcorejs-lib Apis object.
     * @param {boolean} testConnectionQuality   Parameter to turn on/off connection speed test. Default is 'true'.
     * @returns {Promise<any>}                  Connection promise.
     */
    private async connectApi(addresses: string[], api: any, testConnectionQuality: boolean): Promise<any> {
        return new Promise<any>(async (resolve, reject) => {
            if (testConnectionQuality) {
                const conTestResults = await this.testConnectionTime(addresses);
                addresses = conTestResults
                    .filter(r => r.success)
                    .sort((a, b) => a.elapsedTime - b.elapsedTime)
                    .map(r => r.address);
            }

            for (let i = 0; i < addresses.length; i += 1) {
                const address = ['wss', ...addresses[i].split(':').slice(1)].join(':');
                try {
                    const res = await this.getConnectionPromise(address, api);
                    this._isConnected = true;
                    this.connectedAddress = address;
                    console.log('Connected to', address);
                    resolve(res);
                    return;
                } catch (e) {
                    console.log('Fail to connect to', address);
                    api.close();
                }
            }
            this._isConnected = false;
            reject(this.handleError(ApiConnectorError.ws_connection_failed));
        });
    }

    /**
     * Test every address connection time to determine fastest.
     * @param {string[]} addresses                  Addresses to test.
     * @returns {Promise<ConnectionTestResult[]>}   List of ConnectionTestResult.
     */
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

    /**
     * Return promise of connection. Once connection is established Promise is resolved and is able to run operations on apis.
     * Closed connection can be opened using openConnection() method.
     *
     * @returns {Promise<void>}     Connection promise.
     */
    public connect(): Promise<void> {
        if (!this._connectionPromise) {
            return new Promise<void>(((resolve, reject) => reject('connection_closed')));
        }
        return this._connectionPromise;
    }

    /**
     * Opens WS connection based on initialize configuration.
     *
     * @returns {Promise<void>}     Connection promise.
     */
    public openConnection() {
        if (this._connectionPromise === null) {
            this.initConnetion(this._apiAddresses, this._api, this.testConnectionQuality, this.connectionStatusCallback);
        }
    }

    /**
     * Closes opened WS connection.
     */
    public closeConnection(): void {
        this._isConnected = false;
        this._api.close();
        this._connectionPromise = null;
        console.log('Closed connection to', this.connectedAddress);
        this.connectedAddress = null;
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
