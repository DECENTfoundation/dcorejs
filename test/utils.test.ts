import { DecentConfig } from './../src/decent-js';
import { Utils } from './../src/utils';
import * as Decentjs from 'decentjs-lib';
import { setLibRef } from '../src/helpers';
import { print } from 'util';

const bk = 'WORKBOX UPJERK GORBLE SPECULA SUCKLER FUNNEL INWRAP DOSIS DARNEL CATTABU FINGER MINARET TUCKER DENDRIC WOD CULMEN';
const pub = 'DCT5dJjvk9k3yTsnJsAph6V8zEPxsAvJ7FCCzqYWiQQyVTiHvReLz';
const priv = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';
const refPriv = {'d':
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
    setLibRef(Decentjs);
}

describe('Utils methods test', () => {

    beforeAll(() => initLib());

    it('generate keys from brainkey', () => {
        const keys = Utils.generateKeys(bk);
        expect(keys.length).toEqual(2);
    });

    it('generate valid private key', () => {
        const keys = Utils.generateKeys(bk);
        expect(keys[0].stringKey).toEqual(priv);
    });

    it('generate valid public key', () => {
        const keys = Utils.generateKeys(bk);
        expect(keys[1].stringKey).toEqual(pub);
    });

    it('secret from WIF string', () => {
        const secret = Utils.privateKeyFromWif(priv);
        expect(secret.key).toEqual(refPriv);
    });

    it('change amount format', () => {
        const formated = Utils.formatToReadiblePrice(1);
        expect(formated).toEqual('0.00000001');
    });
});
