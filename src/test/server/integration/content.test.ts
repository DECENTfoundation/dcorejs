import * as dcore_js from '../../../../';
import * as chai from 'chai';

const expect = chai.expect;
chai.should();
chai.config.showDiff = false;

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];
const accountId = '1.2.30';
const contentId = '2.13.240';

// turn off unverified certificate rejection
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

before(() => {
    dcore_js.initialize({
        chainId: chainId,
        dcoreNetworkWSPaths: dcoreNetworkAddresses
    });
});
describe('(server/integration) Content fetch', () => {
    it('search content', (done) => {
        const searchParameters = new dcore_js.SearchParams('');
        dcore_js.content().searchContent(searchParameters)
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
        dcore_js.content().getContent(contentId)
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
        const keyPair = new dcore_js.KeyPair(privateKey, elGamalPublic);
        const buyContentId = '2.12.114';
        dcore_js.content().restoreContentKeys(buyContentId, accountId, keyPair)
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
        dcore_js.content().getSeeders(2)
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
        dcore_js.content().getSeeders(2)
            .then(seeders => {
                dcore_js.content().generateContentKeys(seeders.map(s => s.seeder))
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
        dcore_js.content().getPurchasedContent(accountId)
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

