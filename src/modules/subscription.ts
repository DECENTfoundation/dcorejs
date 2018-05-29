import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {SubscriptionError, SubscriptionObject} from '../model/subscription';

export class SubscriptionModule extends ApiModule {
    constructor(dbApi: DatabaseApi) {
        super(dbApi);
    }

    public listActiveSubscriptionByConsumer(consumerId: string, count: number = 100): Promise<SubscriptionObject[]> {
        return new Promise<SubscriptionObject[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListActiveSubscriptionsByConsumer(consumerId, count);
            this.dbApi.execute(operation)
                .then(res => {
                    console.log(res);
                })
                .catch(err => reject(this.handleError(SubscriptionError.database_operation_failed, err)));
        });
    }
}
