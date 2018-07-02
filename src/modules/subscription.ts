import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';
import {DatabaseOperations} from '../api/model/database';
import {SubscriptionError, SubscriptionObject, SubscriptionOptions} from '../model/subscription';
import {Operations} from '../model/transaction';
import {DCoreAssetObject} from '../model/asset';
import {TransactionBuilder} from '../transactionBuilder';
import {Asset, Account} from '../model/account';
import {ApiConnector} from '../api/apiConnector';

export class SubscriptionModule extends ApiModule {
    private connector: ApiConnector;

    constructor(dbApi: DatabaseApi, connector: ApiConnector) {
        super(dbApi);
        this.connector = connector;
    }

    public listActiveSubscriptionsByConsumer(consumerId: string, count: number = 100): Promise<SubscriptionObject[]> {
        return new Promise<SubscriptionObject[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListActiveSubscriptionsByConsumer(consumerId, count);
            this.dbApi.execute(operation)
                .then(res => {
                    resolve(res);
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

    public subscribeToAuthor(from: string, to: string, amount: number, assetId: string, privateKey: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const getAssetOperation = new DatabaseOperations.GetAssets([assetId]);
            this.dbApi.execute(getAssetOperation)
                .then((assets: DCoreAssetObject) => {
                    if (assets[0] === null) {
                        reject(this.handleError(SubscriptionError.asset_does_not_exist));
                        return;
                    }
                    const price: Asset = Asset.create(amount, assets[0]);
                    const subscribeToAuthorOperation = new Operations.Subscribe(from, to, price);
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(subscribeToAuthorOperation);
                    transaction.broadcast(privateKey)
                        .then(result => {
                            resolve(true);
                        })
                        .catch(error => {
                            reject(this.handleError(SubscriptionError.transaction_broadcast_failed, error));
                        });
                })
                .catch((error) => {
                    reject(this.handleError(SubscriptionError.subscription_to_author_failed, error));
                });
        });
    }

    public subscribeByAuthor(from: string, to: string, privateKey: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.connector.connect()
                .then(res => {
                    const subscribeByAuthorOperation = new Operations.SubscribeByAuthor(from, to);
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(subscribeByAuthorOperation);
                    transaction.broadcast(privateKey)
                        .then(() => {
                            resolve(true);
                        })
                        .catch((error) => {
                            reject(this.handleError(SubscriptionError.transaction_broadcast_failed, error));
                        });
                })
                .catch(err => reject(this.handleError(SubscriptionError.blockchain_connection_failed, err)));
        });
    }

    public setAutomaticRenewalOfSubscription(
        accountId: string, subscriptionId: string, automaticRenewal: boolean, privateKey: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            this.connector.connect()
                .then(res => {
                    const setAutomaticRenewalOperation = new Operations.SetAutomaticRenewalOfSubscription(
                        accountId,
                        subscriptionId,
                        automaticRenewal
                    );
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(setAutomaticRenewalOperation);
                    transaction.broadcast(privateKey)
                        .then(() => {
                            resolve(true);
                        })
                        .catch(error => {
                            reject(this.handleError(SubscriptionError.transaction_broadcast_failed, error));
                        });
                })
                .catch(err => reject(this.handleError(SubscriptionError.blockchain_connection_failed, err)));
        });
    }

    public setSubscription(accountId: string,
                           options: SubscriptionOptions,
                           privateKey: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const getAccountOp = new DatabaseOperations.GetAccounts([accountId]);
            if (options.allowSubscription
                && !options.amount
                && !options.subscriptionPeriod) {
                reject(this.handleError(
                    SubscriptionError.missing_options_arguments,
                    'To set subscription all arguments must be filled . Asset is optional.')
                );
                return;
            }
            this.dbApi.execute(getAccountOp)
                .then((accounts: Account[]) => {
                    const getAssetsOp = new DatabaseOperations.GetAssets([options.asset || '1.3.0']);
                    this.dbApi.execute(getAssetsOp)
                        .then((assets: DCoreAssetObject[]) => {
                            if (!assets || !assets[0]) {
                                reject(this.handleError(SubscriptionError.asset_does_not_exist));
                                return;
                            }
                            if (!accounts || !accounts[0]) {
                                reject(this.handleError(SubscriptionError.account_does_not_exist));
                                return;
                            }
                            const [account] = accounts;
                            const [asset] = assets;
                            const newOptions = Object.assign({}, account.options);
                            newOptions.allow_subscription = options.allowSubscription;
                            newOptions.price_per_subscribe = Asset.create(options.amount || 0, asset);
                            newOptions.subscription_period = options.subscriptionPeriod || 0;
                            const accUpdateOp = new Operations.AccountUpdateOperation(
                                accountId,
                                account.owner,
                                account.active,
                                newOptions,
                                {}
                            );
                            const transaction = new TransactionBuilder();
                            transaction.addOperation(accUpdateOp);
                            transaction.broadcast(privateKey)
                                .then(res => resolve(true))
                                .catch(err => reject(this.handleError(SubscriptionError.transaction_broadcast_failed, err)));
                        })
                        .catch(err => reject(this.handleError(SubscriptionError.asset_does_not_exist, err)));
                })
                .catch(err => console.log(err));
        });
    }
}
