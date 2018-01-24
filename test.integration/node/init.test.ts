import * as dcorejs_lib from 'dcorejs-lib';
import * as dcore_js from './../../';
import { expect, should } from 'chai';

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];

function initialize(callback) {
    dcore_js.initialize({
            chainId: chainId,
            dcoreNetworkWSPaths: dcoreNetworkAddresses
        }, dcorejs_lib, callback);
}

describe('Initialize lib ', () => {
    it('conection handle callback response', done => {
        function connectionHandler(state) {
            should().exist(state);
            done();
        }
        initialize(connectionHandler);
    });

    it('successfully connect', (done) => {
        function connectionHandler(state) {
            expect(state).to.equal('open');
            done();
        }
        initialize(connectionHandler);
    });

});
