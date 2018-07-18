/**
 * @module Model/Messaging
 */
export enum MessagingOperationName {
    getMessageObjects = 'get_message_objects',
}

export enum MessagingError {
    query_execution_failed = 'query_execution_failed',
    api_connection_failed = 'api_connection_failed',
    transaction_broadcast_failed = 'transaction_broadcast_failed',
}

export class MessagingOperation {
    protected _name: MessagingOperationName;
    protected _parameters: any[];

    get name(): string {
        return this._name;
    }

    get parameters(): any[] {
        return this._parameters;
    }

    constructor(name: MessagingOperationName, ...params: any[]) {
        this._name = name;
        this._parameters = params;
    }
}

export namespace MessagingOperations {
    export class GetMessageObjects extends MessagingOperation {
        constructor(sender: string, receiver: string, count: number) {
            super(MessagingOperationName.getMessageObjects, sender, receiver, count);
        }
    }
}

export class ConnectionStatus {
    static open = 'open';
}
