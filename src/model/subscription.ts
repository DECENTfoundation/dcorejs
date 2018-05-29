export interface SubscriptionObject {
    from: string;
    to: string;
    expiration: number;
    automatic_renewal: boolean;
}

export enum SubscriptionError {
    database_operation_failed = 'database_operation_failed',
}
