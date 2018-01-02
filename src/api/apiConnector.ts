const BBPromise = require('bluebird');

export class ApiConnector {
    private _connectionPromise: Promise<any>;

    constructor(apiAddresses: string[], api: any) {
        this.initConnetion(apiAddresses, api);
    }

    private initConnetion(addresses: string[], api: any): void {
        const promises: Promise<any>[] = [];
        addresses.forEach(address => {
            promises.push(this.getConnectionPromise(address, api));
        });

        this._connectionPromise = BBPromise.any(promises);
    }

    private getConnectionPromise(forAddress: string, api: any): Promise<any> {
        return api.instance(forAddress, true).init_promise;
    }

    public connect(): Promise<void> {
        return this._connectionPromise;
    }
}
