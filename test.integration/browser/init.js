const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];
const chai = window['chai'];

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];
// turn off unverified certificate rejection
// process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

function initialize(callback) {
    dcore_js.initialize({
        chainId: chainId,
        dcoreNetworkWSPaths: dcoreNetworkAddresses
    }, dcorejs_lib, callback);
}

describe('Initialize lib ', () => {
    it('conection handle callback response', done => {
    function connectionHandler(state) {
    chai.should().exist(state);
    done();
}
initialize(connectionHandler);
});

it('successfully connect', (done) => {
    function connectionHandler(state) {
    console.log(state);
    chai.expect(state).to.equal('open');
    done();
}
initialize(connectionHandler);
});

});
