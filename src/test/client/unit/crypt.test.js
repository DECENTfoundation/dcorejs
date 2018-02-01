const message = 'test message for encryption';
const encryptedMessage = '1bcd2ffea59c19cbff34b21e4c3d78947dd0fc8821e211b543395fcb52a35e15';
const secretWif = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';
const pkeyString = 'DCT5dJjvk9k3yTsnJsAph6V8zEPxsAvJ7FCCzqYWiQQyVTiHvReLz';
const secretEncrypted = '{"ct":"D2ZtQ9VmbWO0lyK/Ps191onhRBWpkM8FPHIkNw/nT1k=","iv":"5803bd0b0d39e0e216502720c22896ea","s":"3f4d194553206afd"}';
const email = 'dd.duskis+st14@gmail.com';

let secret = null;
let pkey = null;

function initLib() {
    secret = dcorejs.Utils.privateKeyFromWif(secretWif);
    pkey = dcorejs.Utils.publicKeyFromString(pkeyString);
}

describe('(client/unit) Crypt helper test', () => {
    before(() => initLib());

    it('encrypt message', () => {
        const encryptedMsg = dcorejs.CryptoUtils.encryptWithChecksum(message, secret, pkey, '');
        expect(encryptedMsg.toString('hex')).to.equal(encryptedMessage);
    }).timeout(5000);

    it('create md5 hash', () => {
        const hash = dcorejs.CryptoUtils.md5('dd.duskis+st14@gmail.com');
        expect(`u${hash}`).to.equal('u5d42a7b0b5713396aac58019eed01d53');
    }).timeout(5000);

    it('encrypt with password', () => {
        const encrypted = dcorejs.CryptoUtils.encrypt(email, 'Password1');
        expect(encrypted).to.be.a('string');
    }).timeout(5000);

    it('decrypt with password', () => {
        const encrypted = dcorejs.CryptoUtils.decrypt(secretEncrypted, 'Password1');
        expect(encrypted).to.equal(email);
    }).timeout(5000);
});
