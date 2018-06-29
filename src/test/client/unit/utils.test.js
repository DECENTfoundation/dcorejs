describe('(client/unit) Utils methods test', () => {

    it('generate keys from brainkey', () => {
        const keys = dcorejs.Utils.generateKeys(bk);
        expect(keys.length).to.equal(2);
    }).timeout(5000);

    it('generate valid private key', () => {
        const keys = dcorejs.Utils.generateKeys(bk);
        expect(keys[0].stringKey).to.equal(priv);
    }).timeout(5000);

    it('generate valid public key', () => {
        const keys = dcorejs.Utils.generateKeys(bk);
        expect(keys[1].stringKey).to.equal(pub);
    }).timeout(5000);

    it('secret from WIF string', () => {
        const secret = dcorejs.Utils.privateKeyFromWif(refPrivateKey);
        expect(secret.stringKey).to.equal(refPrivateKey);
    }).timeout(5000);

    it('change amount format', () => {
        const formated = dcorejs.Utils.formatToReadiblePrice(1);
        expect(formated).to.equal('0.00000001');
    }).timeout(5000);

    it('generates El Gamal keys', () => {
        const elGamalPrivate = dcorejs.Utils.elGamalPrivate(refPrivateKey);
        const elGamalPublic = dcorejs.Utils.elGamalPublic(elGamalPrivate);
        expect(elGamalPrivate).to.equal(refElGamalPrivate);
        expect(elGamalPublic).to.equal(refElGamalPublic);
    });

    it('format asset to DCore format', () => {
        const amount = 100000000;
        const formattedAmount = dcorejs.Utils.formatAmountForDCTAsset(amount);
        expect(formattedAmount).to.equal(1);
    });

    it('format amount to Asset format', () => {
        const amount = 100000000;
        const formattedAmount = dcorejs.Utils.formatAmountForAsset(amount, dctAssetObject);
        expect(formattedAmount).to.equal(1);
    });

    it('format amount from Asset format', () => {
        const amount = 1;
        const formattedAmount = dcorejs.Utils.formatAmountToAsset(amount, dctAssetObject);
        expect(formattedAmount).to.equal(100000000);
    });

    it('generate public El Gamal key from private', () => {
        const elGPub = dcorejs.Utils.elGamalPublic(refElGamalPrivate);
        expect(elGPub).to.equal(refElGamalPublic);
    });
});
