import { Database } from '../api/database';

export class DatabaseApiMock extends Database {
    constructor() {
        super();
    }

    public execute(operation: string, parameters: any[]): Promise<any> {
        return new Promise((resolve, reject) => {
            // switch (operation) {
            //     case DatabaseOperationName.getAccountByName: {
            //         this._api.exec(operation, parameters)
            //             .then((acc: any) => {
            //                 resolve(acc);
            //             })
            //             .catch((err: any) => {
            //                 reject(err);
            //             });
            //     }
            // }
        });
    }
}
