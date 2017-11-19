import { Database } from '../api/database';
export declare class DatabaseApiMock extends Database {
    constructor();
    execute(operation: string, parameters: any[]): Promise<any>;
}
