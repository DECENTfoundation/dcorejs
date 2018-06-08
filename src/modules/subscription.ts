import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {Subscription, SubscriptionError, SubscriptionObject} from '../model/subscription';
import {Operations} from '../model/transaction';
import {DCoreAssetObject} from '../model/asset';
import {Asset} from '../model/account';
import {Transaction} from '../transaction';

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
            const getAssetOperation = new DatabaseOperations.GetAssets([assetId]);
            this.dbApi.execute(getAssetOperation)
                .then((assets: DCoreAssetObject) => {
                    if (assets[0] === null) {
                        reject(this.handleError(SubscriptionError.asset_does_not_exist));
                        return;
                    }
                    const price: Asset = Asset.create(amount, assets[0]);
                    const subscribeToAuthorOperation = new Operations.Subscribe(
                        fromId,
                        toId,
                        price
                    );
                    const transaction = new Transaction();
                    transaction.add(subscribeToAuthorOperation);
                })
                .catch((error) => {
                    reject(this.handleError(SubscriptionError.subscription_to_author_failed));
                });
        });
    }

    public subscribeByAuthor(fromId: string, toId: string): Promise<Boolean> {
        return new Promise<Boolean>(((resolve, reject) => {
            const subscribeByAuthorOperation = new Operations.SubscribeByAuthor(
                fromId,
                toId
            );
            const transaction = new Transaction();
            transaction.add(subscribeByAuthorOperation);
        }));
    }

    public setSubscription(accountId: string, params: Subscription): Promise<Boolean> {
        return new Promise<Boolean>(((resolve, reject) => {
        }));
    }

    public setAutomaticRenewalOfSubscription(accountId: string, subscriptionId: string, automaticRenewal: boolean): Promise<Boolean> {
        return new Promise<Boolean>(((resolve, reject) => {
            const setAutomaticRenewalOperation = new Operations.SetAutomaticRenewalOfSubscription(
                accountId,
                subscriptionId,
                automaticRenewal
            );
            const transaction = new Transaction();
            transaction.add(setAutomaticRenewalOperation);
        }));
    }
}
