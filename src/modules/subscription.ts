import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {SubscriptionError, SubscriptionObject} from '../model/subscription';
import {Operations} from '../model/transaction';
import {dcorejs_lib} from '../helpers';
import {Utils} from '../utils';

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

    public listSubscriptionsByConsumer(consumerId: string, count: number = 100): Promise<SubscriptionObject[]> {
        return new Promise<SubscriptionObject[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSubscriptionsByConsumer(consumerId, count);
            this.dbApi.execute(operation)
                .then(res => {
                    resolve(res);
                })
                .catch(err => reject(this.handleError(SubscriptionError.database_operation_failed, err)));
        });
    }

    public listActiveSubscriptionsByAuthor(authorId: string, count: number = 100): Promise<SubscriptionObject[]> {
        return new Promise<SubscriptionObject[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListActiveSubscriptionsByAuthor(authorId, count);
            this.dbApi.execute(operation)
                .then(res => {
                    resolve(res);
                })
                .catch(err => reject(this.handleError(SubscriptionError.database_operation_failed, err)));
        });
    }

    public listSubscriptionsByAuthor(authorId: string, count: number = 100): Promise<SubscriptionObject[]> {
        return new Promise<SubscriptionObject[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSubscriptionsByConsumer(authorId, count);
            this.dbApi.execute(operation)
                .then(res => {
                    resolve(res);
                })
                .catch(err => reject(this.handleError(SubscriptionError.database_operation_failed, err)));
        });
    }

    public subscribeToAuthor(fromId: string, toId: string, amount: number, assetId: string): Promise<Boolean> {
        return new Promise<Boolean>((resolve, reject) => {
            const operation = new DatabaseOperations.GetAssets([assetId]);
            this.dbApi.execute(operation)
                .then(() => {
                    const subscribeToOperation = new Operations.Subscribe(
                        fromId,
                        toId,
                        Utils.formatAmountToAsset(amount, )
                    );
                    this.dbApi.execute(subscribeToOperation)
                        .then()
                        .catch();
                })
                .catch((error) => {
                    reject(this.handleError(SubscriptionError.subscription_to_author_failed));
                });


        });
    }
}
