import * as dcore_js from '../../../../';
import * as chai from 'chai';
import * as sinon from 'sinon';
import {AccountOrder} from '../../../modules/account';
import {AccountMock} from '../../../mock/accountMock';
import {DatabaseApi} from '../../../api/database';
import {getLibRef} from '../../../helpers';
import {ApiConnector} from '../../../api/apiConnector';
import {DatabaseOperations} from '../../../api/model/database';
import {TransferType} from '../../../model/operationPrototype';

const expect = chai.expect;
chai.should();
chai.config.showDiff = true;

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];
const accountName = 'u46f36fcd24d74ae58c9b0e49a1f0103c';
const accountId = '1.2.27';
const privateKey = '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ';
const transactionId = '1.7.190';
// const memoKey = 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp';

// turn off unverified certificate rejection
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';
const dcore = getLibRef();
const connector = new ApiConnector(dcoreNetworkAddresses, dcore.Apis);

const database = sinon.mock(new AccountMock());

before(() => {
    dcore_js.initialize({
        chainId: chainId,
        dcoreNetworkWSPaths: dcoreNetworkAddresses
    });
});
describe('(server/integration) Account fetch', () => {
    it('get account by id', (done) => {
        const mock = sinon.mock(new DatabaseApi(dcore.Apis, connector).execute(new DatabaseOperations.GetAccounts([accountId])));
        mock.object
            .then(accountMock => {
                dcore_js.account().getAccountById(accountId)
                    .then(res => {
                        expect(res).to.eql(accountMock[0]);
                        done();
                    })
                    .catch(err => {
                        console.log('Error: ', err);
                        chai.assert.isDefined(err);
                    });
            })
            .catch(error => {
                console.log(error);
            });
        });

    it('get account by name', (done) => {
        dcore_js.account().getAccountByName(accountName)
            .then(res => {
                expect(res).to.eql(database.object.account1);
                done();
            })
            .catch(err => {
                console.log('Error: ', err);
                chai.assert.isDefined(err);
            });
    });

    it('get transaction history( HistoryAPI )', (done) => {
        dcore_js.account().getAccountHistory(accountId)
            .then(res => {
                expect(res).to.be.a('array');
                expect(res).to.have.length.above(0);
                done();
            })
            .catch(err => {
                expect(err).to.be.a('array');
                done();
            });
    });

    it('verify transaction', (done) => {
        dcore_js.account().isTransactionConfirmed(accountId, transactionId)
            .then(res => {
                res.should.equal(true);
                done();
            })
            .catch(err => {
                expect(err).to.be.equal(true);
                done();
            });
    });

    it('get account balance', (done) => {
        dcore_js.account().getBalance(accountId)
            .then(balance => {
                expect(balance).to.be.a('number');
                done();
            })
            .catch(err => {
                expect(err).to.be.a('number');
                done();
            });
    });

    it('do transfer', (done) => {
        // dcore_js.account().transfer(0.0000001, '1.3.0', '1.2.27', '1.2.24', '', privateKey)
        //     .then(() => {
        //         done();
        //     })
        //     .catch(err => {
        //         expect(err).to.be.a('number');
        //         done();
        //     });

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
                        expect(operation.fee).to.eql(operationMock.fee);
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

    it('search accounts', (done) => {
        dcore_js.account().searchAccounts('', AccountOrder.none, '0.0.0')
            .then(res => {
                expect(res).to.be.a('array');
                expect(res).to.have.length.above(0);
                done();
            });
    });

    it('get accounts count', (done) => {
        dcore_js.account().getAccountCount()
            .then(res => {
                expect(res).to.be.a('number');
                expect(res).to.be.above(0);
                done();
            });
    });
});

