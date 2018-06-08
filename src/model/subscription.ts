export interface SubscriptionObject {
    from: string;
    to: string;
    expiration: number;
    automatic_renewal: boolean;
}

export interface Subscription {
    allowSubscription: boolean,
    subscriptionPeriod: number,
    amount: number,
    assetId: string
}

export enum SubscriptionError {
    database_operation_failed = 'database_operation_failed',
    asset_does_not_exist = 'asset_does_not_exist',
    subscription_to_author_failed = 'subscription_to_author_failed',
}
