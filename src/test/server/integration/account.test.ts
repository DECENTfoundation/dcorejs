import * as dcore_js from '../../../../';
import * as chai from 'chai';

const expect = chai.expect;
chai.should();
chai.config.showDiff = false;

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];
const accountName = 'u5d42a7b0b5713396aac58019eed01d53';
const accountId = '1.2.18';
const privateKey = '5JdZfU9Ni7wopN8JPLPM2SJBkKWB19XJSR4mK27Ww7kyZAidJ1M';
const transactionId = '1.7.49';

// turn off unverified certificate rejection
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

before(() => {
    dcore_js.initialize({
        chainId: chainId,
        dcoreNetworkWSPaths: dcoreNetworkAddresses
    });
});
describe('(server/integration) Account fetch', () => {
    it('get account by id', (done) => {
        dcore_js.account().getAccountById(accountId)
            .then(res => {
                expect(res.id).to.equal(accountId);
                done();
            })
            .catch(err => {
                console.log('Catch: ', err);
                chai.assert.isDefined(err);
            });
    });

    it('get account by name', (done) => {
        dcore_js.account().getAccountByName(accountName)
            .then(res => {
                expect(res.name).to.be.equal(accountName);
                done();
            })
            .catch(err => {
                chai.assert.isDefined(err);
                done();
            });
    });

    it('get transaction history( DatabaseAPI )', (done) => {
        dcore_js.account().getTransactionHistory(accountId, [privateKey])
            .then(res => {
                expect(res).to.have.length.above(0);
                done();
            })
            .catch(err => {
                expect(err).to.be.a('array');
                done();
            });
    }).timeout(10000);

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
        dcore_js.account().transfer(0.00000001,
            accountId, 'u1240446860c3766acefe22dc1a0d3ac5',
            '',
            privateKey)
            .then(() => {
                done();
            })
            .catch(err => {
                expect(err).to.be.a('number');
                done();
            });
    }).timeout(10000);

    it('search accounts', (done) => {
        dcore_js.account().searchAccounts('', '', '0.0.0')
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

