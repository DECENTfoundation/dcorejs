import * as dcore from 'dcorejs-lib';
import * as dcore_js from './../';

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];

describe('Initialize', () => {
    it('test conection callback', done => {
        function connectionHandler(state) {
            expect(state).toBeDefined();
            done();
        }
        dcore_js.initialize({
            chainId: chainId,
            dcoreNetworkWSPaths: dcoreNetworkAddresses
        }, dcore, connectionHandler);
    });
});
