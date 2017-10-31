export declare class ApisMock {
    private _address;
    private _toFail;
    static instance(address: string): ApisMock;
    private constructor();
    init_promise(): Promise<any>;
    static exec(operation: string, parameters: any[]): Promise<any>;
    private static getAccountByName(name);
}
