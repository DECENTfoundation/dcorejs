/**
 * @module Model/Messaging
 */
export enum MessagingError {
    query_execution_failed = 'query_execution_failed',
    api_connection_failed = 'api_connection_failed',
    transaction_broadcast_failed = 'transaction_broadcast_failed',
    account_does_not_exist = 'account_does_not_exist',
    message_decryption_failed = 'message_decryption_failed',
    syntactic_error = 'syntactic_error',
    invalid_parameters = 'invalid_parameters',
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
    data: string;
}

export interface IDCoreMessagePayload {
    id: string;
    created: string;
    sender: string;
    sender_pubkey: string;
    receivers_data: DCoreReceiversData[];
    text: string;
}

export class DCoreMessagePayload implements IDCoreMessagePayload {
    id = '';
    created = '';
    sender = '';
    sender_pubkey = '';
    receivers_data: DCoreReceiversData[];
    text = '';
}

export interface DCoreReceiversData {
    receiver: string;
    receiver_pubkey: string;
    nonce: string;
    data: string;
}

export enum CustomOperationSubtype {
    undefined,
    messaging,
    max
}
