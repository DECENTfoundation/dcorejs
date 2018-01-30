const contentId = '2.13.240';

before(() => {
    dcorejs.initialize({
        chainId: chainId,
        dcoreNetworkWSPaths: dcoreNetworkAddresses
    }, dcorejs_lib);
});
describe('Content fetch', () => {
    it('search content', (done) => {
        const searchParameters = new dcorejs.SearchParams('');
        dcorejs.content().searchContent(searchParameters)
            .then(res => {
                expect(res).to.be.a('array');
                done();
            })
            .catch(err => {
                console.log('Catch: ', err);
                chai.assert.isDefined(err);
            });
    });

    it('get content', (done) => {
        dcorejs.content().getContent(contentId)
            .then(res => {
                expect(res.id).to.be.equal(contentId);
                done();
            })
            .catch(err => {
                chai.assert.isDefined(err);
                done();
            });
    });

    it('restore content keys', (done) => {
        const elGamalPublic = '7317752633383033582159088' +
            '0415095934922384683502050702002361917832276924025919' +
            '7334324222430627661202908079769675760465400935084759' +
            '1901976526778157668840202.';
        const privateKey = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';
        const keyPair = new dcorejs.KeyPair(privateKey, elGamalPublic);
        const buyContentId = '2.12.114';
        dcorejs.content().restoreContentKeys(buyContentId, accountId, keyPair)
            .then(res => {
                expect(res).a('string');
                done();
            })
            .catch(err => {
                expect(err).to.be.a('array');
                done();
            });
    }).timeout(5000);

    it('get seeders', (done) => {
        dcorejs.content().getSeeders(2)
            .then(res => {
                expect(res).to.be.a('array');
                expect(res).to.have.lengthOf(2);
                done();
            })
            .catch(err => {
                expect(err).to.be.a('array');
                done();
            });
    });

    it('generate content keys', (done) => {
        dcorejs.content().getSeeders(2)
            .then(seeders => {
                dcorejs.content().generateContentKeys(seeders.map(s => s.seeder))
                    .then(res => {
                        expect(res.key).a('string');
                        done();
                    })
                    .catch(err => {
                        expect(err).to.be.equal(true);
                        done();
                    });
            });
    }).timeout(5000);

    it('get purchased content', (done) => {
        dcorejs.content().getPurchasedContent(accountId)
            .then(res => {
                expect(res).to.be.a('array');
                done();
            })
            .catch(err => {
                expect(err).to.be.equal(true);
                done();
            });
    }).timeout(5000);
});

