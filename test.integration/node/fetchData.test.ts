import * as dcorejs_lib from 'dcorejs-lib';
import * as dcore_js from './../../';
import { expect, should } from 'chai';
// require('ssl-root-cas').inject();

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];
// turn off unverified certificate rejection
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

before(() => {
    dcore_js.initialize({
        chainId: chainId,
        dcoreNetworkWSPaths: dcoreNetworkAddresses
    }, dcorejs_lib);
});

it('fail to get data', (done) => {
    dcore_js.account().getAccountById('0.0.0')
    .catch(err => {
        should().exist(err);
        done();
    });
});

it('get account data', (done) => {
    dcore_js.account().getAccountById('1.2.30')
    .then(res => {
        expect(res.id).to.be.equal('1.2.30');
        done();
    });
});
