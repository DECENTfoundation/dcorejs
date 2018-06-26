export enum MessagingError {
    query_execution_failed = 'query_execution_failed',
    api_connection_failed = 'api_connection_failed',
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    account_does_not_exist = 'account_does_not_exist',
    message_decryption_failed = 'message_decryption_failed',
}

export interface MessagePayload {
    from: string;
    pub_from: string;
    receivers_data: ReceiversData[]
}

export interface ReceiversData {
    to: string;
    pub_to: string;
    nonce: number;
    data: any[];
}

export interface DCoreMessagePayload {
    id: string;
    created: string;
    sender: string;
    sender_pubkey: string;
    receivers_data: DCoreReceiversData[];
    text: string;
}

export interface DCoreReceiversData {
    receiver: string;
    receiver_pubkey: string;
    nonce: string;
    data: string;
}