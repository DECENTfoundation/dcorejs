import {Key, KeyParts} from '../content';
import {Authority, Options} from '../account';

/**
 * OperationType to be broadcasted to blockchain
 * internal representation
 */
export class Operation {
    name: OperationName;
    operation: object;

    constructor(name: OperationName, type?: object) {
        this.name = name;
        this.operation = type;
    }
}

export enum OperationName {
    transfer = 'transfer',
    content_cancellation = 'content_cancellation',
    requestToBuy = 'request_to_buy',
    content_submit = 'content_submit',
    account_update = 'account_update',
    account_create = 'account_create',
    leave_rating_and_comment = 'leave_rating_and_comment',
}

/**
 * Asset represent amount of specific
 * asset.
 */
export class Asset {
    amount: number;
    asset_id: string;
}

/**
 * Memo message object representation
 */
export interface Memo {
    from: string;
    to: string;
    nonce: string;
    message: Buffer;
}

/**
 * Operations collection which can be constructed and send to blockchain network
 */
export namespace Operations {
    export class TransferOperation extends Operation {
        constructor(from: string, to: string, amount: Asset, memo: Memo) {
            super(
                OperationName.transfer,
                {
                    from,
                    to,
                    amount,
                    memo
                });
        }
    }

    export class ContentCancelOperation extends Operation {
        constructor(author: string, URI: string) {
            super(
                OperationName.content_cancellation,
                {
                    author,
                    URI
                });
        }
    }

    export class BuyContentOperation extends Operation {
        constructor(
            URI: string,
            consumer: string,
            price: Asset,
            region_code_from: number,
            pubKey: Key
        ) {
            super(
                OperationName.requestToBuy,
                {
                    URI,
                    consumer,
                    price,
                    region_code_from,
                    pubKey
                }
            );
        }
    }

    export class SubmitContentOperation extends Operation {
        constructor(
            size: number,
            author: string,
            co_authors: any[],
            URI: string,
            quorum: number,
            price: RegionalPrice[],
            hash: string,
            seeders: string[],
            key_parts: KeyParts[],
            expiration: string,
            publishing_fee: Asset,
            synopsis: string
        ) {
            super(
                OperationName.content_submit,
                {
                    size,
                    author,
                    co_authors,
                    URI,
                    quorum,
                    price,
                    hash,
                    seeders,
                    key_parts,
                    expiration,
                    publishing_fee,
                    synopsis,
                });
        }
    }

    export class AccountUpdateOperation extends Operation {
        constructor(account: string,
                    owner: Authority,
                    active: Authority,
                    new_options: Options,
                    extensions: {}
        ) {
            super(
                OperationName.account_update,
                {
                    account,
                    owner,
                    active,
                    new_options,
                    extensions
                }
            );
        }
    }

    export class LeaveRatingAndComment extends Operation {
        constructor(URI: string, consumer: string, comment: string, rating: number) {
            super(
                OperationName.leave_rating_and_comment,
                {
                    URI,
                    consumer,
                    comment,
                    rating
                }
            );
        }
    }

    export interface CreateAccountParameters {
        fee?: Asset,
        name?: string,
        owner?: Authority,
        active?: Authority,
        options?: Options,
        registrar?: string,
        extensions?: any
    }

    export class RegisterAccount extends Operation {
        constructor(params: CreateAccountParameters) {
            super(OperationName.account_create, params);
        }
    }
}

export interface RegionalPrice {
    region: number;
    price: Asset;
}

export interface ContentObject {
    author: string;
    co_authors: [string, number];
    expiration: number;
    created: number;
    price: RegionalPrice;
    synopsis: string;
    size: number;
    quorum: number;
    URI: string;
    key_parts: [string, string];
    last_proof: [string, number];
    seeder_price: [string, any];
    is_blocked: boolean;
    ripemd160
    _hash: string;
    AVG_rating: number;
    num_of_ratings: number;
    times_bought: number;
    publishing_fee_escrow: Asset;
    cd: any;
}
