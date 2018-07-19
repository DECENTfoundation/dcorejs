import * as dcore_js from '../../../../';
import * as chai from 'chai';
import * as sinon from 'sinon';
import {SubmitObject, Synopsis} from '../../../model/content';
import {BuyContentType, SubmitContentType} from '../../../model/operationPrototype';

const expect = chai.expect;
chai.should();
chai.config.showDiff = false;

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];
const accountId = '1.2.27';
const privateKey = '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ';
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
    it('add content', (done) => {
        const synopsis: Synopsis = {
            title: 'contentTesting',
            description: 'content test',
            content_type_id: '0',
        };
        const seedersMock = sinon.mock(dcore_js.seeding().listSeedersByPrice(2));
        seedersMock.object
            .then(seeders => {
                if (seeders.length === 2) {
                    const keyMock = sinon.mock(dcore_js.content().generateContentKeys([seeders[0].seeder, seeders[1].seeder]));
                    keyMock.object
                        .then(key => {
                            const submitObject: SubmitObject = {
                                authorId: accountId,
                                coAuthors: [],
                                seeders: seeders,
                                fileName: '/home/katka/decent/dcorejs/contentTesting.txt',
                                date: new Date().toISOString().split('.')[0].toString(),
                                price: 0.000001,
                                size: 16,
                                URI: 'ipfs',
                                hash: key.key,
                                keyParts: key.parts,
                                synopsis: synopsis,
                                assetId: '1.3.0',
                                publishingFeeAsset: '1.3.0',
                            };
                            dcore_js.content().addContent(submitObject, privateKey, false)
                                .then(result => {
                                    const operation: SubmitContentType = result.operation as SubmitContentType;
                                    expect(operation.size).equals(1);
                                    expect(operation.author).equals(accountId);
                                    expect(operation.URI).equals('ipfs');
                                    expect(operation.quorum).equals(2);
                                    expect(operation.hash).equals(key.key);
                                    expect(operation.seeders).eql([seeders[0].seeder, seeders[1].seeder]);
                                    expect(operation.key_parts).eql(key.parts);
                                    done();
                                })
                                .catch(error => {
                                    console.log(error);
                                    chai.assert.isDefined(error);
                                });
                        })
                        .catch(error => {
                            console.log(error);
                            chai.assert.isDefined(error);
                        });
                } else {
                    const error = 'Not enough seeders. Required minimum is two.';
                    console.log('Error: ', error);
                    chai.assert.isDefined(error);
                }
            })
            .catch(error => {
                console.log(error);
                chai.assert.isDefined(error);
            });
    });

    it('buy content', (done) => {

        const elGammalPrivate = dcore_js.Utils.elGamalPrivate(privateKey);
        const elGammalPublic = dcore_js.Utils.elGamalPublic(elGammalPrivate);
        const buyerId = '1.2.62';
        const buyerPrivateKey = '5Jz3i2MEZNFJAFfRvJwTDtLULzoxmQH6aP7VKbQnc8ZrJa1K4qZ';

        const contentMock = sinon.mock(dcore_js.content().getContent(contentId));
        contentMock.object
            .then(content => {
                dcore_js.content().buyContent(contentId, buyerId, elGammalPublic, buyerPrivateKey, false)
                    .then(result => {
                        const operation: BuyContentType = result.operation as BuyContentType;
                        expect(operation.consumer).equals(buyerId);
                        expect(operation.URI).equals(content.URI);
                        expect(operation.pubKey.s).equals(elGammalPublic);
                        done();
                    })
                    .catch(error => {
                        console.log(error);
                        chai.assert.isDefined(error);
                    });
            })
            .catch(error => {
                console.log('Mock Error: ', error);
                chai.assert.isDefined(error);
            });

    });


});

