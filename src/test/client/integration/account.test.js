
const accountName = 'u5d42a7b0b5713396aac58019eed01d53';
const privateKey = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';
const transactionId = '1.7.15355';

before(() => {
    dcorejs.initialize({
        chainId: chainId,
        dcoreNetworkWSPaths: dcoreNetworkAddresses
    }, dcorejs_lib);
});
describe('(client/integration) Account module', () => {
    it('get account by id', (done) => {
        dcorejs.account().getAccountById(accountId)
            .then(res => {
                expect(res.id).to.equal(accountId);
                done();
            })
            .catch(err => {
                console.log('Catch: ', err);
                chai.assert.isDefined(err);
            });
    }).timeout(5000);

    it('get account by name', (done) => {
        dcorejs.account().getAccountByName(accountName)
            .then(res => {
                expect(res.name).to.be.equal(accountName);
                done();
            })
            .catch(err => {
                chai.assert.isDefined(err);
                done();
            });
    }).timeout(5000);

    it('get transaction history( DatabaseAPI )', (done) => {
        dcorejs.account().getTransactionHistory(accountId, [privateKey])
            .then(res => {
                expect(res).to.have.length.above(0);
                done();
            })
            .catch(err => {
                expect(err).to.be.a('array');
                done();
            });
    }).timeout(5000);

    it('get transaction history( HistoryAPI )', (done) => {
        dcorejs.account().getAccountHistory(accountId)
            .then(res => {
                expect(res).to.be.a('array');
                expect(res).to.have.length.above(0);
                done();
            })
            .catch(err => {
                expect(err).to.be.a('array');
                done();
            });
    }).timeout(5000);

    it('verify transaction', (done) => {
        dcorejs.account().isTransactionConfirmed(accountId, transactionId)
            .then(res => {
                res.should.equal(true);
                done();
            })
            .catch(err => {
                expect(err).to.be.equal(true);
                done();
            });
    }).timeout(5000);

    it('get account balance', (done) => {
        dcorejs.account().getBalance(accountId)
            .then(balance => {
                expect(balance).to.be.a('number');
                done();
            })
            .catch(err => {
                expect(err).to.be.a('number');
                done();
            });
    }).timeout(5000);

    it('transfer asset', (done) => {
        dcorejs.account().transfer(0.00000001,
            accountId, 'u5c88063211031ce2278b3fbd522b6ec4',
            '',
            privateKey)
            .then(() => {
                done();
            })
            .catch(err => {
                expect(err).to.be.a('number');
                done();
            });
    }).timeout(15000);

});

