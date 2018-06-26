import {ApiModule} from './ApiModule';
import {MessagingApi} from '../api/messaging';
import {DatabaseApi} from '../api/database';
import {Operations} from '../model/transaction';
import {Transaction} from '../transaction';
import {KeyPrivate, KeyPublic} from '../utils';
import {DatabaseOperations} from '../api/model/database';
import {Account} from '../model/account';
import {CryptoUtils} from '../crypt';
import {DCoreMessagePayload, MessagePayload, MessagingError} from '../model/messaging';
import {MessagingOperations} from '../api/model/messaging';

export class MessagingModule extends ApiModule {
    private _message_api: MessagingApi;

    constructor(dbApi: DatabaseApi, messageApi: MessagingApi) {
        super(dbApi);
        this._message_api = messageApi;
    }

    public getSentMessages(sender: string, receiver: string, decryptPrivateKey: string, count: number = 100): Promise<DCoreMessagePayload[]> {
        return new Promise<DCoreMessagePayload[]>(((resolve, reject) => {
            const op = new MessagingOperations.GetMessageObjects(sender, receiver, count);
            this._message_api.execute(op)
                .then((messages: any[]) => {
                    messages.map((msg: DCoreMessagePayload) => {
                        if (msg.receivers_data.length !== 0) {
                            try {
                                msg.text = CryptoUtils.decryptWithChecksum(
                                    msg.receivers_data[0].data,
                                    KeyPrivate.fromWif(decryptPrivateKey),
                                    KeyPublic.fromString(msg.receivers_data[0].receiver_pubkey),
                                    msg.receivers_data[0].nonce
                                ).toString('utf-8');
                            } catch (e) {
                                reject(this.handleError(MessagingError.message_decryption_failed, e));
                                return;
                            }
                        } else {
                            msg.text = '';
                        }
                    });
                    resolve(messages);
                })
                .catch(err => reject(this.handleError(MessagingError.query_execution_failed, err)));
        }));
    }

    public getMessages(receiver: string, count: number = 100): Promise<any> {
        return new Promise<any>(((resolve, reject) => {
            const op = new MessagingOperations.GetMessageObjects(null, receiver, count);
            this._message_api.execute(op)
                .then((messages: any[]) => {
                    resolve(messages);
                })
                .catch(err => reject(this.handleError(MessagingError.query_execution_failed, err)));
        }));
    }

    public getMessageObjects(sender?: string, receiver?: string, count: number = 100): Promise<any> {
        return new Promise<any>(((resolve, reject) => {
            const op = new MessagingOperations.GetMessageObjects(sender, receiver, count);
            this._message_api.execute(op)
                .then((messages: any[]) => {
                    resolve(messages);
                })
                .catch(err => reject(this.handleError(MessagingError.query_execution_failed, err)));
        }));
    }

    public sendMessage(sender: string, receiverId: string, message: string, privateKey: string): Promise<boolean> {
        return new Promise<boolean>(((resolve, reject) => {
            const getAccOp = new DatabaseOperations.GetAccounts([receiverId]);
            this.dbApi.execute(getAccOp)
                .then((accounts: Account[]) => {
                    if (!accounts || !accounts[0]) {
                        reject(this.handleError(MessagingError.account_does_not_exist));
                        return;
                    }
                    const [toAccount] = accounts;
                    const messagePayload: MessagePayload = {
                        from: sender,
                        pub_from: KeyPrivate.fromWif(privateKey).getPublicKey().stringKey,
                        receivers_data: [
                            {
                                to: receiverId,
                                pub_to: toAccount.options.memo_key,
                                nonce: 0,
                                data: []
                            }
                        ]
                    };
                    const buffer = new Buffer(JSON.stringify(messagePayload)).toString('hex');
                    const result = [];
                    for (let i = 0; i < buffer.length; i += 2) {
                        result.push(buffer[i] + buffer[i + 1]);
                    }

                    const customOp = new Operations.CustomOperation(sender, [sender], 1, result);
                    const transaction = new Transaction();
                    transaction.addOperation(customOp);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(true))
                        .catch(err => reject(this.handleError(MessagingError.query_execution_failed)));
                })
                .catch(err => console.log(err));
        }));
    }
}
