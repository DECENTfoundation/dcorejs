import * as dcore_js from '../../../../';
import * as chai from 'chai';
import * as sinon from 'sinon';
import {DatabaseApi} from '../../../api/database';
import {getLibRef} from '../../../helpers';
import {ApiConnector} from '../../../api/apiConnector';
import {DatabaseOperations} from '../../../api/model/database';
import {CreateAccountType, TransferType, UpdateAccountType} from '../../../model/operationPrototype';
import {UpdateAccountParameters} from '../../../model/account';

const expect = chai.expect;
chai.should();
chai.config.showDiff = true;

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];
const accountId = '1.2.27';
const privateKey = '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ';
const ownerKey = 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp';
const activeKey = 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp';
const memoKey = 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp';

// turn off unverified certificate rejection
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const dcore = getLibRef();
const connector = new ApiConnector(dcoreNetworkAddresses, dcore.Apis);

before(() => {
    dcore_js.initialize({
        chainId: chainId,
        dcoreNetworkWSPaths: dcoreNetworkAddresses
    });
});
describe('(server/endToEnd) Account fetch', () => {

    it('transfer', (done) => {
        const mock = sinon.mock(new DatabaseApi(dcore.Apis, connector).execute(new DatabaseOperations.GetAccounts(['1.2.27', '1.2.24'])));
        mock.object
            .then(result => {
                const operationMock = {
                    from: '1.2.27',
                    to: '1.2.24',
                    amount: { asset_id: '1.3.0', amount: 10 },
                    memo: {
                        from: result[0].options.memo_key,
                        to: result[1].options.memo_key,
                    },
                    fee: {amount: 0, asset_id: 0}
                };
                dcore_js.account().transfer(0.0000001, '1.3.0', '1.2.27', '1.2.24', '', privateKey, false)
                    .then(result => {
                        const operation = result.operation as TransferType;
                        expect(operation.from).to.equals(operationMock.from);
                        expect(operation.to).to.equals(operationMock.to);
                        expect(operation.amount).to.eql(operationMock.amount);
                        expect(operation.memo.from).to.equals(operationMock.memo.from);
                        expect(operation.memo.to).to.equals(operationMock.memo.to);
                        done();
                    })
                    .catch(err => {
                        console.log('Error: ', err);
                        chai.assert.isDefined(err);
                    });
            })
            .catch(error => {
                console.log('Mock error: ', error);
            });
    }).timeout(15000);


    it('register account', (done) => {
        const accountName = Date.now().toString();
        const mock = sinon.mock(new DatabaseApi(dcore.Apis, connector).execute(new DatabaseOperations.GetAccounts([accountId])));
        mock.object
            .then(result => {
                const operationMock = {
                    name: accountName,
                    owner: Object.assign({}, result[0].owner),
                    active: Object.assign({}, result[0].active),
                    options: {
                        memo_key: memoKey,
                        voting_account: '1.2.3',
                        allow_subscription: false,
                        price_per_subscribe: {amount: 0, asset_id: '1.3.0'},
                        num_miner: 0,
                        votes: [],
                        extensions: [],
                        subscription_period: 0,
                    },
                    registrar: accountId,
                };
                dcore_js.account().registerAccount(accountName, ownerKey, activeKey, memoKey, accountId, privateKey, false)
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
            })
            .catch(error => {
                console.log('Mock error: ', error);
            });
    });

    it('update account', (done) => {
        const mock = sinon.mock(new DatabaseApi(dcore.Apis, connector).execute(new DatabaseOperations.GetAccounts([accountId])));
        mock.object
            .then(result => {
                const numMiner = 5;
                const params: UpdateAccountParameters = {
                    newNumMiner: numMiner,
                };
                const operationMock = {
                    account: accountId,
                    owner: Object.assign({}, result[0].owner),
                    active: Object.assign({}, result[0].active),
                    new_options: {
                        memo_key: result[0].options.memo_key,
                        voting_account: result[0].options.voting_account,
                        num_miner: numMiner,
                        votes: result[0].options.votes,
                        extensions: result[0].options.extensions,
                        allow_subscription: result[0].options.allow_subscription,
                        price_per_subscribe: Object.assign({}, result[0].options.price_per_subscribe),
                        subscription_period: result[0].options.subscription_period,
                    },
                    extensions: {},
                    fee: {amount: 0, asset_id: 0},
                };
                dcore_js.account().updateAccount(accountId, params, privateKey, false)
                    .then(result => {
                        const operation = result.operation as UpdateAccountType;
                        expect(operation).to.eql(operationMock);
                        done();
                    })
                    .catch(err => {
                        console.log('Error: ', err);
                        chai.assert.isDefined(err);
                    });
            })
            .catch(error => {
                console.log('Mock error: ', error);
            });
    });

});

