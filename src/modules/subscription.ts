/**
 * @module SeedingModule
 */
import { ApiModule } from './ApiModule';
import { DatabaseApi } from '../api/database';
import { DatabaseOperations } from '../api/model/database';
import { SubscriptionError, SubscriptionObject, SubscriptionOptions } from '../model/subscription';
import { Operations, Operation } from '../model/transaction';
import { DCoreAssetObject } from '../model/asset';
import { TransactionBuilder } from '../transactionBuilder';
import { Asset, Account } from '../model/account';
import { ApiConnector } from '../api/apiConnector';
import { Type } from '../model/types';
import { Validator } from './validator';

export class SubscriptionModule extends ApiModule {
    constructor(dbApi: DatabaseApi, connector: ApiConnector) {
        super({
            dbApi,
            apiConnector: connector
        });
    }

    /**
     * List all active subscriptions from given account id.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a732057e0cae2f15bac9ab72a8f13ec73
     *
     * @param {string} consumerId                       Account id in format '1.2.X'. Example: "1.2.345"
     * @param {number} count                            Limit of listed subscriptions. If empty, default is 100.
     * @returns {Promise<SubscriptionObject[]>}
     */
    public listActiveSubscriptionsByConsumer(consumerId: string, count: number = 100): Promise<SubscriptionObject[]> {
        if (!Validator.validateArguments([consumerId, count], [Type.string, Type.number])) {
            throw new TypeError(SubscriptionError.invalid_parameters);
        }
        return new Promise<SubscriptionObject[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListActiveSubscriptionsByConsumer(consumerId, count);
            this.dbApi.execute(operation)
                .then(res => {
                    resolve(res);
                })
                .catch(err => reject(this.handleError(SubscriptionError.database_operation_failed, err)));
        });
    }

    /**
     * List all subscriptions from given account id.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a4887c65f9c311f542d3af7202893fcd8
     *
     * @param {string} consumerId                       Account id in format '1.2.X'. Example: "1.2.345"
     * @param {number} count                            Limit of listed subscriptions. If empty, default is 100.
     * @returns {Promise<SubscriptionObject[]>}
     */
    public listSubscriptionsByConsumer(consumerId: string, count: number = 100): Promise<SubscriptionObject[]> {
        if (!Validator.validateArguments([consumerId, count], [Type.string, Type.number])) {
            throw new TypeError(SubscriptionError.invalid_parameters);
        }
        return new Promise<SubscriptionObject[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSubscriptionsByConsumer(consumerId, count);
            this.dbApi.execute(operation)
                .then(res => {
                    resolve(res);
                })
                .catch(err => reject(this.handleError(SubscriptionError.database_operation_failed, err)));
        });
    }

    /**
     * List all active subscriptions from given account id.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a01e03e723cd880533deca48fa43fe209
     *
     * @param {string} authorId                         Account id in format '1.2.X'. Example: "1.2.345"
     * @param {number} count                            Limit of listed subscriptions. If empty, default is 100.
     * @returns {Promise<SubscriptionObject[]>}
     */
    public listActiveSubscriptionsByAuthor(authorId: string, count: number = 100): Promise<SubscriptionObject[]> {
        if (!Validator.validateArguments([authorId, count], [Type.string, Type.number])) {
            throw new TypeError(SubscriptionError.invalid_parameters);
        }
        return new Promise<SubscriptionObject[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListActiveSubscriptionsByAuthor(authorId, count);
            this.dbApi.execute(operation)
                .then(res => {
                    resolve(res);
                })
                .catch(err => reject(this.handleError(SubscriptionError.database_operation_failed, err)));
        });
    }

    /**
     * List all subscriptions from given account id.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a46ee4050e3e2579a4c637dfeed6f883b
     *
     * @param {string} authorId                         Account id in format '1.2.X'. Example: "1.2.345"
     * @param {number} count                            Limit of listed subscriptions. If empty, default is 100.
     * @returns {Promise<SubscriptionObject[]>}
     */
    public listSubscriptionsByAuthor(authorId: string, count: number = 100): Promise<SubscriptionObject[]> {
        if (!Validator.validateArguments([authorId, count], [Type.string, Type.number])) {
            throw new TypeError(SubscriptionError.invalid_parameters);
        }
        return new Promise<SubscriptionObject[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSubscriptionsByConsumer(authorId, count);
            this.dbApi.execute(operation)
                .then(res => {
                    resolve(res);
                })
                .catch(err => reject(this.handleError(SubscriptionError.database_operation_failed, err)));
        });
    }

    /**
     * Subscribe to author transaction.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a6174aa8cf4ab5066c82dde4e51808339
     *
     * @param {string} from                             Account id in format '1.2.X'. Example: "1.2.345"
     * @param {string} to                               Account id in format '1.2.X'. Example: "1.2.345"
     * @param {number} amount                           Amount that you want to subscribe with.
     * @param {string} assetId                          Id of asset that you want to subscribe with in format: '1.3.X'. Example: "1.3.0"
     * @param {string} privateKey                       Private key used to sign transaction.
     * @param {boolean} broadcast                       Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}
     */
    public subscribeToAuthor(from: string, to: string, amount: number, assetId: string,
        privateKey: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [from, to, amount, assetId, privateKey, broadcast],
            [Type.string, Type.string, Type.number, Type.string, Type.string, Type.boolean])) {
            throw new TypeError(SubscriptionError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
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
                    this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch((error) => {
                    reject(this.handleError(SubscriptionError.subscription_to_author_failed, error));
                });
        });
    }

    /**
     * Subscribe by author transaction.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#ab3443e059dcbd63a10338351bdbfac84
     *
     * @param {string} from                             Account id in format '1.2.X'. Example: "1.2.345"
     * @param {string} to                               Account id in format '1.2.X'. Example: "1.2.345"
     * @param {string} privateKey                       Private key used to sign transaction.
     * @param {boolean} broadcast                       Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}
     */
    public subscribeByAuthor(from: string, to: string, privateKey: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [from, to, privateKey, broadcast],
            [Type.string, Type.string, Type.string, Type.boolean])
        ) {
            throw new TypeError(SubscriptionError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
            this.apiConnector.connection()
                .then(res => {
                    const subscribeByAuthorOperation = new Operations.SubscribeByAuthor(from, to);
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(subscribeByAuthorOperation);
                    this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(err => reject(this.handleError(SubscriptionError.blockchain_connection_failed, err)));
        });
    }

    /**
     * Set automatic renewal of subscription from given account id.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a7efefe11ee58caad2924e874977f6003
     *
     * @param {string} accountId                            Account id in format '1.2.X'. Example: "1.2.345"
     * @param {string} subscriptionId                       Subscription id in format '1.6.X'. Example: "1.6.100"
     * @param {boolean} automaticRenewal                    True if enabled, false if disabled automatic renewal of given subscription.
     * @param {string} privateKey                           Private key used to sign transaction.
     * @param {boolean} broadcast                           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}
     */
    public setAutomaticRenewalOfSubscription(accountId: string, subscriptionId: string, automaticRenewal: boolean,
        privateKey: string, broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [accountId, subscriptionId, automaticRenewal, privateKey, broadcast],
            [Type.string, Type.string, Type.boolean, Type.string, Type.boolean])
        ) {
            throw new TypeError(SubscriptionError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
            this.apiConnector.connection()
                .then(res => {
                    const setAutomaticRenewalOperation = new Operations.SetAutomaticRenewalOfSubscription(
                        accountId,
                        subscriptionId,
                        automaticRenewal
                    );
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(setAutomaticRenewalOperation);
                    this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                        .then(res => resolve(res))
                        .catch(err => reject(err));
                })
                .catch(err => reject(this.handleError(SubscriptionError.blockchain_connection_failed, err)));
        });
    }

    /**
     * Update account with new subscription options.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#aadb6a2c911db0e578036c8d5a7da19b8
     *
     * @param {string} accountId                            Account id in format '1.2.X'. Example: "1.2.345"
     * @param {SubscriptionOptions} options                 Subscription option in format: {
     *                                                          allowSubscription: boolean;
     *                                                          subscriptionPeriod: number;
     *                                                          amount: number;
     *                                                          asset?: string;
     *                                                      }
     *                                                      Asset is optional, default is '1.3.0'. Example: {
     *                                                          allowSubscription: true,
     *                                                          subsctiptionPeriod: 30,
     *                                                          amount: 0.00000001
     *                                                      }
     * @param {string} privateKey                           Private key used to sign transaction
     * @param {boolean} broadcast                           Transaction is broadcasted if set to 'true'. Default value is 'true'.
     * @returns {Promise<Operation>}
     */
    public setSubscription(accountId: string,
        options: SubscriptionOptions,
        privateKey: string,
        broadcast: boolean = true): Promise<Operation> {
        if (!Validator.validateArguments(
            [accountId, options, privateKey, broadcast],
            [Type.string, SubscriptionOptions, Type.string, Type.boolean])
        ) {
            throw new TypeError(SubscriptionError.invalid_parameters);
        }
        return new Promise<Operation>((resolve, reject) => {
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
                            this.finalizeAndBroadcast(transaction, privateKey, broadcast)
                                .then(res => resolve(res))
                                .catch(err => reject(err));
                        })
                        .catch(err => reject(this.handleError(SubscriptionError.asset_does_not_exist, err)));
                })
                .catch(err => {
                    reject(this.handleError(SubscriptionError.database_operation_failed, err));
                });
        });
    }
}
