import {KeyPublic} from '../../../model/utils';
import {CryptoUtils} from '../../../crypt';
import {expect} from 'chai';
import {KeyPrivate} from '../../../model/utils';

const message = 'test message for encryption';
const encryptedMessage = '1bcd2ffea59c19cbff34b21e4c3d78947dd0fc8821e211b543395fcb52a35e15';
const secretWif = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';
const pkeyString = 'DCT5dJjvk9k3yTsnJsAph6V8zEPxsAvJ7FCCzqYWiQQyVTiHvReLz';
const secretEncrypted = '{"ct":"D2ZtQ9VmbWO0lyK/Ps191onhRBWpkM8FPHIkNw/nT1k=","iv":"5803bd0b0d39e0e216' +
    '502720c22896ea","s":"3f4d194553206afd"}';
const email = 'dd.duskis+st14@gmail.com';
const messageObject = {'keys': [';adfsjkndsffdjsfdsjdfsjkldfsajklfsjlka', 'oph82h42942bp    bp784bp78   gbp9g2bp2b']};
const plainMessageEnc = '48310cc50094bd09181c6e8b8147ac622268942f100021b41dd51f637b1c7546f7455f5ffe2e20f373b425f9380169b27d6dbe5a8a3' +
    'ec398eb0e336555077de346e02bce6f8e0b3e1ec659ebe80dd30833ebac2d89b5d1bbabf485a4e9b00d16';

let secret = '';
let pkey = '';

function initLib() {
    secret = secretWif;
    pkey = pkeyString;
}

describe('(server/unit) Crypt helper test', () => {
    before(() => initLib());

    it('encrypt message', () => {
        const encryptedMsg = CryptoUtils.encryptWithChecksum(message, secret, pkey, '');
        expect(encryptedMsg).to.equal(encryptedMessage);
    });

    it('create md5 hash', () => {
        const hash = CryptoUtils.md5('dd.duskis+st14@gmail.com');
        expect(`u${hash}`).to.equal('u5d42a7b0b5713396aac58019eed01d53');
    });

    it('create sha256 hash', () => {
        const hash = CryptoUtils.sha256('dd.duskis+st14@gmail.com');
        expect(hash).to.equal('462b25ab8691e689b8b7fc6d2193d3db868b65fcdd293d118aa39cb1414df449');
    });

    it('create sha512 hash', () => {
        const hash = CryptoUtils.sha512('dd.duskis+st14@gmail.com');
        expect(hash).to.equal('93c6499a86f6891c00b47f1dc17d8400922bc3887c4b33485d853793df59863245aad895763bddc1c' +
            'eb1e2bff95a2f8b29f8cc019d3c9a72385929780a88e285');
    });

    it('encrypt with password', () => {
        const encrypted = CryptoUtils.encrypt(email, 'Password1');
        expect(encrypted).to.be.a('string');
    }).timeout(5000);

    it('decrypt with password', () => {
        const encrypted = CryptoUtils.decrypt(secretEncrypted, 'Password1');
        expect(encrypted).to.equal(email);
    }).timeout(5000);

    it('encrypt - wallet compatible', () => {
        const stringMsg = JSON.stringify(messageObject);
        const res = CryptoUtils.encryptToHexString(stringMsg, 'Password1');
        expect(res).to.equal(plainMessageEnc);
    });

    it('decrypt - wallet compatible', () => {
        const res = CryptoUtils.decryptHexString(plainMessageEnc, 'Password1');
        expect(res).to.equal(JSON.stringify(messageObject));
    });
});
