import * as chai from 'chai';
import * as sinon from 'sinon';
import { DatabaseApi } from '../../../api/database';
import { getLibRef } from '../../../helpers';
import { ApiConnector } from '../../../api/apiConnector';
import { CreateAccountType, TransferType, UpdateAccountType } from '../../../model/operationPrototype';
import { UpdateAccountParameters } from '../../../model/account';
import { AccountModule } from '../../../modules/account';
import { HistoryApi } from '../../../api/history';
import { ChainApi } from '../../../api/chain';

const expect = chai.expect;
chai.should();
chai.config.showDiff = true;

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = [];
const accountId = '1.2.27';
const privateKey = '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ';
const ownerKey = 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp';
const activeKey = 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp';
const memoKey = 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp';

// turn off unverified certificate rejection
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const dcorejs_lib = getLibRef();
const accounts = require('./fixtures/accounts.json');
const assets = require('./fixtures/assets.json');

let apiConnector: ApiConnector;
let chainApi: ChainApi;
let historyApi: HistoryApi;
let databaseApi: DatabaseApi;
let accountModule: AccountModule;

before(() => {
    this.apiConnector = sinon.stub(ApiConnector.prototype, 'connectApi').callsFake(() => new Promise(resolve => resolve()));
    apiConnector = new ApiConnector(dcoreNetworkAddresses, dcorejs_lib.Apis);
    chainApi = new ChainApi(apiConnector, dcorejs_lib.ChainStore);
    historyApi = new HistoryApi(dcorejs_lib.Apis, apiConnector);
    databaseApi = new DatabaseApi(dcorejs_lib.Apis, apiConnector);
    accountModule = new AccountModule(databaseApi, chainApi, historyApi, apiConnector);
    this.apiConnector.restore();
});

beforeEach(() => {
    this.fetch = sinon.stub(chainApi, 'fetch');
    this.getAccountById = sinon.stub(accountModule, 'getAccountById');
});

afterEach(() => {
    this.fetch.restore();
    this.getAccountById.restore();
});

describe('(server/integration) Account fetch', () => {

    it('transfer', (done) => {
        const accountFrom = accounts.all[0];
        const accountTo = accounts.all[1];
        const operationMock = {
            from: accountFrom.id,
            to: accountTo.id,
            amount: { asset_id: '1.3.0', amount: 10 },
            memo: {
                from: accountFrom.options.memo_key,
                to: accountTo.options.memo_key,
            },
            fee: { amount: 0, asset_id: 0 }
        };
        this.fetch.resolves([accountFrom, accountTo, assets.dct_asset]);
        accountModule.transfer(0.0000001, '1.3.0', accountFrom.id, accountTo.id, '', privateKey, false)
            .then(res => {
                // const operation = res.operation as TransferType;
                // expect(operation.from).to.equals(operationMock.from);
                // expect(operation.to).to.equals(operationMock.to);
                // expect(operation.amount).to.eql(operationMock.amount);
                // expect(operation.memo.from).to.equals(operationMock.memo.from);
                // expect(operation.memo.to).to.equals(operationMock.memo.to);
                // expect(JSON.stringify(operation.amount)).to.equals(JSON.stringify(operationMock.amount));
                done();
            })
            .catch(err => {
                console.log('Error: ', err);
                chai.assert.isDefined(err);
            });
    });


    it('register account', (done) => {
        const accountFrom = accounts.all[0];

        const accountName = Date.now().toString();
        const operationMock = {
            name: accountName,
            owner: Object.assign({}, accountFrom.owner),
            active: Object.assign({}, accountFrom.active),
            options: {
                memo_key: memoKey,
                voting_account: '1.2.3',
                allow_subscription: false,
                price_per_subscribe: { amount: 0, asset_id: '1.3.0' },
                num_miner: 0,
                votes: [],
                extensions: [],
                subscription_period: 0,
            },
            registrar: accountFrom.id,
        };
        accountModule.registerAccount(accountName, ownerKey, activeKey, memoKey, accountId, privateKey, false)
            .then(result => {
                const operation = result.operation as CreateAccountType;
                expect(operation.name).to.equals(operationMock.name);
                expect(operation.owner).to.eql(operationMock.owner);
                expect(operation.active).to.eql(operationMock.active);
                expect(operation.options).to.eql(operationMock.options);
                expect(operation.registrar).to.equals(operationMock.registrar);
                done();
            })
            .catch(err => {
                console.log('Error: ', err);
                chai.assert.isDefined(err);
            });
    });

    it('update account', (done) => {
        this.getAccountById.resolves(accounts.all[0]);
        const accountFrom = accounts.all[0];
        const numMiner = 3;
        const params: UpdateAccountParameters = {
            newNumMiner: numMiner,
        };
        const operationMock = {
            account: accountId,
            owner: Object.assign({}, accountFrom.owner),
            active: Object.assign({}, accountFrom.active),
            new_options: {
                memo_key: accountFrom.options.memo_key,
                voting_account: accountFrom.options.voting_account,
                num_miner: numMiner,
                votes: accountFrom.options.votes,
                extensions: accountFrom.options.extensions,
                allow_subscription: accountFrom.options.allow_subscription,
                price_per_subscribe: Object.assign({}, accountFrom.options.price_per_subscribe),
                subscription_period: accountFrom.options.subscription_period,
            },
            extensions: {},
            fee: { amount: 0, asset_id: 0 },
        };
        accountModule.updateAccount(accountFrom.id, params, privateKey, false)
            .then(result => {
                const operation = result.operation as UpdateAccountType;
                expect(JSON.stringify(operation)).to.eql(JSON.stringify(operationMock));
                done();
            })
            .catch(err => {
                console.log('Error: ', err);
                chai.assert.isDefined(err);
            });
    });

});

