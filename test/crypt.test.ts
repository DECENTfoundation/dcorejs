import { KeyPrivate, KeyPublic } from '../src/utils';
import { CryptoUtils } from '../src/crypt';
import { setLibRef } from './../src/helpers';
import * as DecentLib from 'decentjs-lib';
import { Utils } from '../src/utils';

const message = 'test message for encryption';
const encryptedMessage = '1bcd2ffea59c19cbff34b21e4c3d78947dd0fc8821e211b543395fcb52a35e15';
const secretWif = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';
const pkeyString = 'DCT5dJjvk9k3yTsnJsAph6V8zEPxsAvJ7FCCzqYWiQQyVTiHvReLz';
let secret: KeyPrivate = null;
let pkey: KeyPublic = null;

function initLib() {
    setLibRef(DecentLib);
    secret = Utils.privateKeyFromWif(secretWif);
    pkey = Utils.publicKeyFromString(pkeyString);
}

describe('Crypt helper test', () => {
    beforeAll(() => initLib());

    it('encrypt message', () => {
        const encryptedMessage = CryptoUtils.encryptWithChecksum(message, secret, pkey, '');
        expect(encryptedMessage).toEqual(encryptedMessage);
    });

    it('create md5 hash', () => {
        const hash = CryptoUtils.md5('dd.duskis+st14@gmail.com');
        expect(`u${hash}`).toEqual('u5d42a7b0b5713396aac58019eed01d53');
    });
});
