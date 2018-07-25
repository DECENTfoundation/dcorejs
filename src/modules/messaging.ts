/**
 * @module MessagingModule
 */
import {ApiModule} from './ApiModule';
import {MessagingApi} from '../api/messaging';
import {DatabaseApi} from '../api/database';
import {Operations} from '../model/transaction';
import {TransactionBuilder} from '../transactionBuilder';
import {KeyPrivate, KeyPublic, Utils} from '../utils';
import {DatabaseOperations} from '../api/model/database';
import {Account} from '../model/account';
import {CryptoUtils} from '../crypt';
import {CustomOperationSubtype, DCoreMessagePayload, MessagePayload, MessagingError} from '../model/messaging';
import {MessagingOperations} from '../api/model/messaging';

export class MessagingModule extends ApiModule {
    constructor(dbApi: DatabaseApi, messageApi: MessagingApi) {
        super({
            dbApi,
            messagingApi: messageApi
        });
    }

    /**
     * List sent messages.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a2e9a6ada3838f085342b101dd2011b03
     *
     * @param {string} sender                       Account id of sender, in format '1.2.X'. Example '1.2.345'.
     * @param {string} decryptPrivateKey            Private key for memo decryption. Default is ''. Therefore none of messages is decrypted.
     * @param {number} count                        Limit result size. Default 100(Max).
     * @returns {Promise<DCoreMessagePayload[]>}    List of DCoreMessagePayload objects.
     */
    public getSentMessages(sender: string, decryptPrivateKey: string = '', count: number = 100): Promise<DCoreMessagePayload[]> {
        return new Promise<DCoreMessagePayload[]>(((resolve, reject) => {
            this.getMessageObjects(sender, null, decryptPrivateKey, count)
                .then((messages: any[]) => {
                    resolve(messages);
                })
                .catch(err => reject(this.handleError(MessagingError.query_execution_failed, err)));
        }));
    }

    /**
     * List messages.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a810a737e6edae4bfb28e89f47833a54b
     *
     * @param {string} receiver                     Account id of receiver, in format '1.2.X'. Example '1.2.345'.
     * @param {string} decryptPrivateKey            Private key to sign transaction.
     * @param {number} count                        Limit result size. Default 100(Max).
     * @returns {Promise<DCoreMessagePayload[]>}    List of DCoreMessagePayload objects.
     */
    public getMessages(receiver: string, decryptPrivateKey: string = '', count: number = 100): Promise<DCoreMessagePayload[]> {
        return new Promise<DCoreMessagePayload[]>(((resolve, reject) => {
            this.getMessageObjects(null, receiver, decryptPrivateKey, count)
                .then((messages: any[]) => {
                    resolve(messages);
                })
                .catch(err => reject(this.handleError(MessagingError.query_execution_failed, err)));
        }));
    }

    /**
     * List message objects.
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#a7cb689db3eeba6eb74ea2920d5c96236
     *
     * @param {string} sender                       Account id of sender, in format '1.2.X'. Example '1.2.345'.
     * @param {string} receiver                     Account id of receiver, in format '1.2.X'. Example '1.2.345'.
     * @param {string} decryptPrivateKey            Private key to decrypt messages content.
     * @param {number} count                        Limit result count. Default 100(Max)
     * @returns {Promise<DCoreMessagePayload[]>}    List of DCoreMessagePayload message objects.
     */
    public getMessageObjects(sender?: string,
                             receiver?: string,
                             decryptPrivateKey: string = '',
                             count: number = 100): Promise<DCoreMessagePayload[]> {
        return new Promise<DCoreMessagePayload[]>(((resolve, reject) => {
            const op = new MessagingOperations.GetMessageObjects(sender, receiver, count);
            this.messagingApi.execute(op)
                .then((messages: any[]) => {
                    resolve(this.decryptMessages(messages, decryptPrivateKey));
                })
                .catch(err => reject(this.handleError(MessagingError.query_execution_failed, err)));
        }));
    }

    private decryptMessages(messages: DCoreMessagePayload[], decryptPrivateKey: string): DCoreMessagePayload[] {
        const result = [].concat(messages);
        result.map((msg: DCoreMessagePayload) => {
            if (msg.receivers_data.length !== 0) {
                try {
                    msg.text = CryptoUtils.decryptWithChecksum(
                        msg.receivers_data[0].data,
                        KeyPrivate.fromWif(decryptPrivateKey),
                        KeyPublic.fromString(msg.receivers_data[0].receiver_pubkey),
                        msg.receivers_data[0].nonce
                    ).toString('utf-8');
                } catch (e) {
                    msg.text = '';
                }
            } else {
                msg.text = '';
            }
        });
        return result;
    }

    /**
     * Send encrypted message
     * https://docs.decent.ch/developer/classgraphene_1_1wallet_1_1detail_1_1wallet__api__impl.html#ab7e7eed9c157ff1c352c2179501b36c6
     *
     * @param {string} sender           Account id of sender, in format '1.2.X'. Example '1.2.345'.
     * @param {string} receiverId       Account id of receiver, in format '1.2.X'. Example '1.2.345'.
     * @param {string} message          Content of message.
     * @param {string} privateKey       Private key to encrypt message and sign transaction.
     * @returns {Promise<boolean>}      Value confirming successful transaction broadcasting.
     */
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
                                nonce: Number(Utils.generateNonce()),
                                data: ''
                            }
                        ]
                    };
                    const encryptedMsg = CryptoUtils.encryptWithChecksum(
                        message,
                        KeyPrivate.fromWif(privateKey),
                        KeyPublic.fromString(toAccount.options.memo_key),
                        messagePayload.receivers_data[0].nonce.toString()
                    );
                    messagePayload.receivers_data[0].data = encryptedMsg.toString('hex');
                    const buffer = new Buffer(JSON.stringify(messagePayload)).toString('hex');

                    const customOp = new Operations.CustomOperation(sender, [sender], CustomOperationSubtype.messaging, buffer);
                    const transaction = new TransactionBuilder();
                    transaction.addOperation(customOp);
                    transaction.broadcast(privateKey)
                        .then(res => resolve(true))
                        .catch(err => reject(this.handleError(MessagingError.query_execution_failed)));
                })
                .catch(err => {
                    reject(this.handleError(MessagingError.api_connection_failed, err));
                });
        }));
    }
}
