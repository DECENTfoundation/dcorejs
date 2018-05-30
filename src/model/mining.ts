export interface MinerUpdateData {
    newUrl?: string;
    newSigningKey?: string;
}

export enum MiningError {
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    database_fetch_failed = 'database_fetch_failed',
    connection_failed = 'connection_failed',
    miner_does_not_exist = 'miner_does_not_exist'
}
