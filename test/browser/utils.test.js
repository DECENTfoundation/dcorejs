const refPriv = {
    'd':
        {
            '0': 27151925,
            '1': 41621333,
            '2': 41055047,
            '3': 29420413,
            '4': 11471687,
            '5': 45279530,
            '6': 58047144,
            '7': 66159550,
            '8': 15684202,
            '9': 854246,
            't': 10,
            's': 0
        }
};

describe('Utils methods test', () => {

    it('generate keys from brainkey', () => {
        const keys = dcorejs.Utils.generateKeys(bk);
        expect(keys.length).to.equal(2);
    });

    it('generate valid private key', () => {
        const keys = dcorejs.Utils.generateKeys(bk);
        expect(keys[0].stringKey).to.equal(priv);
    });

    it('generate valid public key', () => {
        const keys = dcorejs.Utils.generateKeys(bk);
        expect(keys[1].stringKey).to.equal(pub);
    });

    it('secret from WIF string', () => {
        const secret = dcorejs.Utils.privateKeyFromWif(priv);
        Object.keys(secret.key.d).forEach(k => {
            expect(secret.key.d[k]).to.equal(refPriv.d[k]);
        });
    });

    it('change amount format', () => {
        const formated = dcorejs.Utils.formatToReadiblePrice(1);
        expect(formated).to.equal('0.00000001');
    });
});
