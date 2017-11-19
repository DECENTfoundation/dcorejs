export declare class ApisMock {
    private _address;
    private _toFail;
    static exec(operation: string, parameters: any[]): Promise<any>;
    static getAccountByName(name: string): any;
    static instance(address: string): ApisMock;
    private constructor();
    init_promise(): Promise<any>;
}
