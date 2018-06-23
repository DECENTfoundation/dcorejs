import {Utils} from '../../../utils';
import * as dcorejs_lib from 'dcorejs-lib';
import {setLibRef} from '../../../helpers';
import {expect} from 'chai';
import {DCoreAssetObject} from '../../../model/asset';

const bk = 'WORKBOX UPJERK GORBLE SPECULA SUCKLER FUNNEL INWRAP DOSIS DARNEL CATTABU FINGER MINARET TUCKER DENDRIC WOD CULMEN';
const pub = 'DCT5dJjvk9k3yTsnJsAph6V8zEPxsAvJ7FCCzqYWiQQyVTiHvReLz';
const priv = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';
const refElGamalPrivate = '995148271311054691065477011654988113333995189557838160534771306325983453509632335555982804728847520959577' +
    '6035312706007755854990617069594416307472971521354';
const refElGamalPublic = '1476592897265129256906985148863834019333244843526837587739241973266771272616315012971707289842820560922634' +
    '174697696963038593504885326978206069960938313296';
const refPrivateKey = '5KfaSt8mWyGcZXRk4HKmt77ERJsBQz8QXintiAvUFCMasL2KYTL';
const dctAssetObject: DCoreAssetObject = {
        'id': '1.3.0',
        'symbol': 'DCT',
        'precision': 8,
        'issuer': '1.2.1',
        'description': '',
        'options': {
            'max_supply': '7319777577456900',
            'core_exchange_rate': {'base': {'amount': 1, 'asset_id': '1.3.0'}, 'quote': {'amount': 1, 'asset_id': '1.3.0'}},
            'is_exchangeable': true,
            'extensions': []
        },
        'dynamic_asset_data_id': '2.3.0'
    };

function initLib() {
    setLibRef(dcorejs_lib);
}

describe('(server/unit) Utils methods test', () => {

    before(() => initLib());

    it('generate keys from brainkey', () => {
        const keys = Utils.generateKeys(bk);
        expect(keys.length).to.equal(2);
    });

    it('generate valid private key', () => {
        const keys = Utils.generateKeys(bk);
        expect(keys[0].stringKey).to.equal(priv);
    });

    it('generate valid public key', () => {
        const keys = Utils.generateKeys(bk);
        expect(keys[1].stringKey).to.equal(pub);
    });

    it('secret from WIF string', () => {
        const secret = Utils.privateKeyFromWif(refPrivateKey);
        expect(secret.stringKey).to.equal(refPrivateKey);
    });

    it('change amount format', () => {
        const formated = Utils.formatToReadiblePrice(1);
        expect(formated).to.equal('0.00000001');
    });

    it('generates El Gamal keys', () => {
        const elGamalPrivate = Utils.elGamalPrivate(refPrivateKey);
        const elGamalPublic = Utils.elGamalPublic(elGamalPrivate);
        expect(elGamalPrivate).to.equal(refElGamalPrivate);
        expect(elGamalPublic).to.equal(refElGamalPublic);
    });

    it('generate public El Gamal key from private', () => {
        const elGPub = Utils.elGamalPublic(refElGamalPrivate);
        expect(elGPub).to.equal(refElGamalPublic);
    });

    it('format asset to DCore format', () => {
        const amount = 100000000;
        const formattedAmount = Utils.formatAmountForDCTAsset(amount);
        expect(formattedAmount).to.equal(1);
    });

    it('format amount to Asset format', () => {
        const amount = 100000000;
        const formattedAmount = Utils.formatAmountForAsset(amount, dctAssetObject);
        expect(formattedAmount).to.equal(1);
    });

    it('format amount from Asset format', () => {
        const amount = 1;
        const formattedAmount = Utils.formatAmountToAsset(amount, dctAssetObject);
        expect(formattedAmount).to.equal(100000000);
    });
});
