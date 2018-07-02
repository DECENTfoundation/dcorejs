import {Account, HistoryRecord} from '../model/account';

export class AccountMock {

    private account1: Account = {
        id: '1.2.27',
        registrar: '1.2.15',
        name: 'u46f36fcd24d74ae58c9b0e49a1f0103c',
        owner: {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [ [ 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp', 1 ] ],
        },
        active: {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [ [ 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp', 1 ] ],
        },
        options: {
            memo_key: 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp',
            voting_account: '1.2.3',
            num_miner: 3,
            votes: ['0:1', '0:3', '0:4', '0:10', '0:11'],
            extensions: [],
            allow_subscription: true,
            price_per_subscribe: {
                amount: 50000,
                asset_id: '1.3.0',
            },
        },
        rights_to_publish: {
            is_publishing_manager: false,
            publishing_rights_received: [],
            publishing_rights_forwarded: [],
        },
        statistics: '2.5.27',
        top_n_control_flags: 0,
    };

    private account2: Account = {
        id: '1.2.62',
        registrar: '1.2.27',
        name: 'katkaaa',
        owner: {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [ [ 'DCT7igrr2cmiJ8zp8TZaVEVoquFwNTDe984zcs5m6LFaGaYXkRBfp', 1 ] ],
        },
        active: {
            weight_threshold: 1,
            account_auths: [],
            key_auths: [ [ 'DCT7igrr2cmiJ8zp8TZaVEVoquFwNTDe984zcs5m6LFaGaYXkRBfp', 1 ] ],
        },
        options: {
            memo_key: 'DCT7igrr2cmiJ8zp8TZaVEVoquFwNTDe984zcs5m6LFaGaYXkRBfp',
            voting_account: '1.2.3',
            num_miner: 0,
            votes: [],
            extensions: [],
            allow_subscription: true,
            price_per_subscribe: {
                amount: 500000,
                asset_id: '1.3.0',
            },
        },
        rights_to_publish: {
            is_publishing_manager: false,
            publishing_rights_received: [],
            publishing_rights_forwarded: [],
        },
        statistics: '2.5.62',
        top_n_control_flags: 0,
    };

    private accountHistory: HistoryRecord = {
        id: '1.7.2811',
        op: [ 0, {
            fee: { amount: 500000, asset_id: '1.3.0' },
            from: '1.2.27',
            to: '1.2.24',
            amount: { amount: 10, asset_id: '1.3.0' },
            memo: {
                from: 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp',
                to: 'DCT5ekSrX6Gp4cJbGaAeAbpogRD8ZnqPhsfumrZ4Bnow277kozTpc',
                nonce: '391814751497708',
                message: '96be0c2bf1c674edd0f9656afa5656ed'
            },
            extensions: []
        }],
        result: [ 0, {} ],
        block_num: 1039301,
        trx_in_block: 0,
        op_in_trx: 0,
        virtual_op: 6488,
    };

    public getAccountByIdMock(): Account {
        return this.account1;
    }

    public getAccountByNameMock(): Account {
        return this.account1;
    }

    public getAccountHistoryMock(): HistoryRecord[] {
        return [this.accountHistory];
    }

    public isTransactionConfirmedMock() {
        return true;
    }

    public getAccountBalanceMock(): number {
        return 9921.37702192;
    }

    public searchAccounts(): Account[] {
        return [this.account1, this.account2];
    }

    public countAccounts(): number {
        return 10;
    }
}
