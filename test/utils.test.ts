import { Utils } from './../src/utils';
import * as dcorejs_lib from 'dcorejs-lib';
import { setLibRef } from '../src/helpers';
import { expect } from 'chai';
import { KeyPrivate } from '../src/utils';
import BigInteger from 'bigi';

const bk = 'WORKBOX UPJERK GORBLE SPECULA SUCKLER FUNNEL INWRAP DOSIS DARNEL CATTABU FINGER MINARET TUCKER DENDRIC WOD CULMEN';
const pub = 'DCT5dJjvk9k3yTsnJsAph6V8zEPxsAvJ7FCCzqYWiQQyVTiHvReLz';
const priv = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';
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

function initLib() {
    setLibRef(dcorejs_lib);
}

describe('Utils methods test', () => {

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
        const secret = Utils.privateKeyFromWif(priv);
        Object.keys(secret.key.d).forEach(k => {
            expect(secret.key.d[k]).to.equal(refPriv.d[k]);
        });
    });

    it('change amount format', () => {
        const formated = Utils.formatToReadiblePrice(1);
        expect(formated).to.equal('0.00000001');
    });
});
