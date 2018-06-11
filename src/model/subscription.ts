export interface SubscriptionObject {
    from: string;
    to: string;
    expiration: number;
    automatic_renewal: boolean;
}

export interface Subscription {
    allow_subscription: boolean,
    subscription_period: number,
    price_amount: number,
    price_asset_symbol: string
}

export enum SubscriptionError {
    database_operation_failed = 'database_operation_failed',
    asset_does_not_exist = 'asset_does_not_exist',
    account_does_not_exist = 'account_does_not_exist',
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    subscription_to_author_failed = 'subscription_to_author_failed',
}
