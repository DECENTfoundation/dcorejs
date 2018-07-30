/**
 * @module Model/Subscription
 */
export interface SubscriptionObject {
    id: string,
    from: string;
    to: string;
    expiration: number;
    automatic_renewal: boolean;
}

export enum SubscriptionError {
    database_operation_failed = 'database_operation_failed',
    asset_does_not_exist = 'asset_does_not_exist',
    account_does_not_exist = 'account_does_not_exist',
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    subscription_to_author_failed = 'subscription_to_author_failed',
    subscription_does_not_exist = 'subscription_does_not_exist',
    blockchain_connection_failed = 'blockchain_connection_failed',
    missing_options_arguments = 'missing_options_arguments',
    syntactic_error = 'syntactic_error',
    invalid_parameters = 'invalid_parameters',
}

export interface ISubscriptionOptions {
    allowSubscription: boolean;
    subscriptionPeriod: number;
    amount: number;
    asset?: string;
}

export class SubscriptionOptions implements ISubscriptionOptions {
    allowSubscription: boolean;
    subscriptionPeriod: number;
    amount: number;
    asset?: string = undefined;
}


