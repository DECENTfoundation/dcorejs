import * as dcore_js from '../../../../';
import * as chai from 'chai';

const expect = chai.expect;
chai.should();
chai.config.showDiff = false;

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];
// const accountId = '1.2.18';
// const privateKey = '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ';
// const contentId = '2.13.240';

// turn off unverified certificate rejection
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

before(() => {
    dcore_js.initialize({
        chainId: chainId,
        dcoreNetworkWSPaths: dcoreNetworkAddresses
    });
});

describe('(server/endToEnd) Content fetch', () => {
    it('search content', (done) => {
        dcore_js.content().searchContent()
            .then(res => {
                expect(res).to.be.a('array');
                done();
            })
            .catch(err => {
                console.log('Catch: ', err);
                chai.assert.isDefined(err);
            });

        // const submitObject: SubmitObject = {
        //     authorId: '',
        //     coAuthors: [''],
        //     seeders: Seeder[],
        //     fileName: string,
        //     date: Date,
        //     price: number,
        //     size: number,
        //     URI: string,
        //     hash: string,
        //     keyParts: KeyParts[],
        //     synopsis: Synopsis,
        //     assetId: string,
        //     publishingFeeAsset: string,
        // };
        // dcore_js.content().addContent(submitObject, privateKey, false)
        //     .then()
        //     .catch(error => {
        //
        //     });
    });


});

