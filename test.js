// import * as dcorejs from './';
// import * as aesjs from 'aes-js';
// import * as cryptoJs from 'crypto-js';
// import * as dcorejslib from 'dcorejs-lib';
// import * as fs from 'fs';
// import {WordArray} from 'crypto-js';

const dcorejs = require('./');
const BigInteger = require('bigi');

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];

process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

dcorejs.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
});

// async function test() {
//     const res = await dcorejs.account().test();
//     console.log(res);
// }

nehe();

function nehe() {
//     const msg = '4d09b1b3ba398c40aaaa03c988df25597254a84137c0ef90e2f426f57dafc6ed12f65f98d346ecaa0a2911ac7d6d07adb19c26e24107356ede6f56e56de3541ccf02594d4fd94134d7426933e697e9f430ed4756a2952d81fd05ebce027f6a8cae2cf5247e0b3429d006c454c4a33dfc527aa7e16a399b98ede29ad7ccf0d5539dbb96e6aab74c7eafa659267cf8862298822f0f3b5e757d569deebe9105e3ab6c4f82fdc4ef3d99c6ba16af92dde5973a27051295c6712aae2c2572e7f386ac8b2cd45663c102103024da870ca740af8ea14128034c3cf99a26812867ae8779281d9006afc5ad17e41bf1e60e621b38260449e2506bd4147284021a50adba5cc368ff14bf83dd4b312df6f9ab322da24386b94ba8c9c9061a46413cb2dd55dbb66d73913115befabb3a6775c597f84ca48fe52900ed4c65bcc4c79e80747a8c6726043ae920cd0d6c67828c70545fe0d47e4a784132e05b5639e5a43e426153674411a8ac82649e7f702f1a68f5e5a39cd8a24fd02b2b67dc0ef3f045bea01ecf273f72717f6bf68c546236736bdf69038ed2b03c71b48d20413f572b50c159d677e857fc3df5e81e20e4fdeab0e7f41f75ccbe910a503f42b3742e6d7742f81cd10d3cc40c042aa5fae901ecfbf12e9693095ad2b5017caf91c20d4f975c0cf5c82633d27fc601113942888757c93c56fd9c71e1c364891bfe0729e87f5051639012798822240609b892d0d72fd1d788c9e7ccbb6b13e0b14cb4c76dcf8ca47034e5235b4c093bbdcce0757d97c18f0c560624949e827505a366a28abf74bb8314049fc7bb99d4028ce5471fc7d410875dd75a653c47d85f5244473dc48530742b312e186f8cde03b07e2b284bd726c10dff334f4bea14747aac0afdcb30d99b306625a514cb381dc5f528bf20e8736d93d3a781f7aea0e54408855c1b645f2fdf5f2db28c6f22a67019a75fb66cec52a540931bb300591d7163330fe11fb14755ce7c6c0200bf866a7eb4a3652724a75308d4081ff9812c311dd4856e3a8e7b1812181d3efb02ef9870e92e1ce2126690be59725289645488a2dcae447d6b42ea19fb257bc67c735f02409ee762e69aedb9d9b71b505bc4bca39d8eaba5e571f997aa941413e1224f4b6b6b6d5a0c05a7ccd405680e3b91d794e2c4951efc17b2a7db9e6d17d2bed64685c11588dc37ec317a3763379fa32a47ae73641d06f6702c7bc3a8534e24095e976d78a405';
//     const msg2 = '4d09b1b3ba398c40aaaa03c988df25597254a84137c0ef90e2f426f57dafc6ed12f65f98d346ecaa0a2911ac7d6d07adb19c26e24107356ede6f56e56de3541ccf02594d4fd94134d7426933e697e9f430ed4756a2952d81fd05ebce027f6a8cae2cf5247e0b3429d006c454c4a33dfc527aa7e16a399b98ede29ad7ccf0d5539dbb96e6aab74c7eafa659267cf8862298822f0f3b5e757d569deebe9105e3ab6c4f82fdc4ef3d99c6ba16af92dde5973a27051295c6712aae2c2572e7f386ac8b2cd45663c102103024da870ca740af8ea14128034c3cf99a26812867ae8779281d9006afc5ad17e41bf1e60e621b3827f1be30b1092a972c1e51d71f0b39bc7fe4e409ac5fda97262507843c08096de60d9818778df0648146756dc3aea740cd034b17662b9372ecb32bf3dcb7274d490a76fb8f16ee819b6240e660b0ca4dccc018dc8bdf53b7695ac2d7b53a1f597f5385c80955b28298295f49d4a1284cbd495286532c848ddeda981c809aee400944facab124592e79f710b95090016b330856e81e761448d03586ab80c6840032c9e292f7b2604752eef91043734501c00f51e6d95b191d0ec7f70c743165d6b5ce9652df979729430463b02047e830e610d5dcad65db49a14a0a09171fa609a5dd13c6fa8fa4b4a3b39dfdc6be6379cc55599d119a59a3c077d90e17ecc7c603f762455abafe0c7cc2fe071a48b1c651b4f93f0c988c4cecec5e7e7264e96def636387cc61f85f37b96ca05861a3e0becf99d946ff7498e38fe78cc9c9620d93348ecf1535bbe265decd0fdd43169c8dfef8a3ddcbbdc2153092f949038a45d02d607062f44c177235dc062cc2086bc881526d20f5d3e5b84c275a2922b7993f896dcb5d9688b5251d676d6f6af39bac25dea55c044cbfe09bcc79bde4fbc0db2a279be361bd7f8f9bd32c737c99de40fe9d5a8c690bf7ed2541be6ad80bff0fc46bac5a27532462264b17220e7a45cfb74d7651ed193f5ac8596094c631270d361baf1d63b329f675bfdb3b2370ea33ca9f4ac6fddbd87762158890da7bec3fec156fa8836767a93c8ca74e0f6a011e65ce14442cf8c86a7311150c8a604b58c7b239a8b87ca9eb80ea1cae9deccdec6e3598ba076f82da7f56215ce911c766b93e3aca54348861b8b536b7157e06a3a70ed486367090d99b695c5992df06754869967cb820883027a9c39708c653a117c0928528bad99cd75bac0445d2a103117270c2f14c41a7ecd46717f165bc75303f8952aa7ee2e27754f196eb2ce1aa4571f40795720fb068541f4ac89d18dcada2584f2333755610e6202318bb140c0dc014d593720ae09f221eaaabe7c6cf9a0a0a0af759b916dfbbe97b307cde1963b75d2b02567fdf1fe77c295362e826f669f4bab9d7f2d261ef54ca45d33d1b4158fed5854b98467c5cd2fc2c6eaa57a5885de93cf00d2816d21b20871cd473970956b957b3683c9389358c1d37c0186c9cce92a0198f3dd816ca1f756766f91960ab74a81d9605a524f728d5d9b4d620cea3e2200db4daa1de520117abfc';
//     const pass = 'aaa';
//     const mssg = '{"ct":"W1q3AZPs81fBKw8GaSOXqrvsDN6EerlAxSQ2fXDGl0Kqzqjv7SDnKsnp4Gon2DIyg/kSAVbbwgnRBY7mMXk5iNb24RTg1vnlghO0Bl9RyyGxiwPgDQR3/RZMutYovYmyF6DEtZP/rtDtFSh2zMBJMHgZlTghDuyE7xnPxDX19iczdjjD/oYDL5C76o/t3116t+C7DwDxNw06NRkjYS0F1VeE7jECeYDFuHZG6P7kcZkB9tdNp+APYtJ3TaWX6vbVcKwvaGYhvPgW/Djr37ARif+55vkWNMKLeACSigDTKFyczQIIeRJnNiHIAIjaq7+o25mzhyCrLr5Ce5BXVy1KOJrmKU5j29aIFvDv/ZwI7McfuZp6Fdzht7Bg/F2mN8CtXvzlf0HQg0FQlW8Y5oRlqOd3WnyC/PTuAeFeSL6NKQDBNaCCXoLGsgtvLs5DolxYImn87c5ve+bPhV0OdAiELjK/RE6QwAMvbqU6gdi1OYPjZ2642/pgVn2e7lqw4i206hYVU0nEOX3gc6YENe/FUAR/0Rurp+MVLyeHIT90pdZRRtW9rrTN4cez4Qcn9cg84+HV0AYFcoIIaA2PZ9x9PJzH6Qje8ijHbHEqTZdMJLo0vmeigFpbTCCBYufF2T6avBMRoyX9rr1Fwp9+oBnZDak6k37jDXBkPmHYLM/pGCr0e6HMSh0SThi6FPWJrZavsFFpAVMv2mWQ1ssxvmHF7LDSYyqjNGQt/jcZsEt5SjEZmAM8xTiG2e3g9p5nHfxckh6z1URKmsKMUkQmHZM9NwLxlvlXIw1ITLT0R2xsCNGJBBqd8tcwS9Zsk9qNzdTJdGKaIbdt3CBpCKZLyKCKmTjvE+xNPMYrKpklnY19SqQ+sZ93mcyG8ipEtsVxtMauFeoM7x05FJWS5Z76bHARbkoFJ5sDYOTEH+nPzVBSKl2L5TQmua92PVeZ2r5LlGaUBZJkz6wjbmb/aVMS2eW/TQ==","iv":"45f6b997db632028672f1ae3977ee347","s":"60eeda8494b2f781"}';
//     const hash = cryptoJs.SHA512(pass).toString(cryptoJs.enc.Hex);
//     const passHash = 'd6f644b19812e97b5d871658d6d3400ecd4787faeb9b8990c1e7608288664be77257104a58d033bcf1a0e0945ff06468ebe53e2dff36e248424c7273117dac09';
//     const ivHex = passHash.substr(64, 32);
//     const keyHex = passHash.substr(0, 64);
//     // console.log(key);
//     // console.log(iv);
//
//     console.log(dcorejs.CryptoUtils.decrypt(msg, 'Password1'));
//
//     // ===========================================================================
//     const iv = cryptoJs.enc.Hex.parse(ivHex);
//     const key = cryptoJs.enc.Hex.parse(keyHex);
//
//     const cipher_array = cryptoJs.enc.Hex.parse(msg);
//     const plainwords = cryptoJs.AES.decrypt({ ciphertext: cipher_array, salt: null,  iv: iv }, key, { iv: iv });
//     const plainHex = cryptoJs.enc.Hex.stringify(plainwords);
//
//     // console.log(cipher_array);
//
//     const buff = new Buffer(plainHex, 'hex');
//     // console.log(buff.toString());
//     // ===========================================================================
//
//     const aes2 = dcorejslib.Aes.fromSha512(hash);
//     // const aes = new dcorejslib.Aes(iv, key);
//     // console.log(aes2.iv.toString());
//     // console.log(aes2.key.toString());
//     // console.log(aes.decrypt(msg).toString('hex'));
//
//     const dec = aes2.decryptHexToBuffer(msg); // <<+ =============
//     // console.log(dec.toString());
//
//     // const wa = {
//     //     iv: dec.iv,
//     //     salt: null,
//     //     ciphertext: msg2,
//     //     key: dec.key
//     // }
//     //
//     // const aes = cryptoJs.AES.decrypt(wa, hash);
//     //
//     // console.log(dec);
//     // console.log(aes.toString());
//     // fs.writeFile('./decryptResult', dec.toString(), err => {
//     //     if (err) {
//     //         console.error(err);
//     //         return;
//     //     }
//     //     console.log('file created');
//     // });
//     // console.log(dec.toString('hex'));
//
//     // const decryptedText = ee.safeDecrypt('aaa', msg);
//     // console.log(decryptedText);
//
// }
//
// function muha() {
//     const pass = 'aaa';
//     const keys = {
//         keys: [
//             ';adfsjkndsffdjsfdsjdfsjkldfsajklfsjlka', 'oph82h42942bp    bp784bp78   gbp9g2bp2b'
//         ]
//     };
//     const message = JSON.stringify(keys);
//     const hash = cryptoJs.SHA512(pass).toString(cryptoJs.enc.Hex);
//     // const iv = hash.substr(64, 64);
//     // const key = hash.substr(0, 64);
//     // const aes = new dcorejslib.Aes(iv, key);
//     // const aes = dcorejslib.Aes.fromSha512(hash);
//     const aes = dcorejslib.Aes.fromSeed(pass);
//     const enc = aes.encryptToHex(message).toString();
//     // console.log(encr.toString());
//     // const dec = aes.decryptHexToBuffer(encr);
//     // console.log(dcorejs.CryptoUtils.decrypt(enc, pass));
//     // fs.writeFile('./decryptResult', dec.toString(), err => {
//     //     if (err) {
//     //         console.error(err);
//     //         return;
//     //     }
//     //     console.log('file created');
//     // });
//     // const r = dcorejs.CryptoUtils.encryptToHexString(message, pass);
//     // console.log(r);
//     const msg = '5890922c7047330e4727322a917184b3fb372547ecb1bb0d3cde48b9797c4b0aa8c6f5e628dffe6ded5ca701b01f16642bb0d009bb78c01090c25f02aa646b952bd2619bf6c3c90f23b4e604404bf62d840abaef8a40a34976d3a669ce228194600f81e80c12ac33906029f3a7314ee9b7870e7f6c1d48354e0c01df4e617ed00583e11831724af97cd209c106db349bb4e71808726119023b2634ac175c048b36fb96e6eaa247c6f976da87a21aa41d7c161670cf40548bb13146828aa4ef26e71119496f66be69b6bc8dd19f6b817bf5151946cec266afc69cb76ffff6218481d53b4651aeca4eb98320026c2cfe80a2354eb69b65ee666aef4f21f92621dc6564074256858d1134d7eb2c429ad5879d1d554003bdf0dcb9e24e4775289ffeb6424c694f57e5c62dbce9e8b79ffb7b10f64214de84eb649ea1e29ee60345cbc2168e0f0a3b54259728b68e970d9600da074b2c4d2ab799e06edae39970413a3bc9930143a81f2351366728c0a8f56f5fa78640eca2550f826a67d9e2cdbdedd5a937aa279232e69552e69bd15d10ab35dec4ed58b32947e4b3bfcb81d61f1bbb1e256a9bf2b830b290ead11d2b30845454cf1efa6948594f1d65ecb15f6a3e1e39a37e93ba9be780bdbacee0191d559d687babce959ee0ad9cffff51aee8d6fd8df1a5052fab13f4d88e8e719cb81ef966d4c4c349767a52ceb721ee17d436609a725865ff687b5078855e0d88fb487c3f1771e166696eafe8ef551cc7d2000801c8e0a2eb9e17de90928aa63db5e614101bd2549fb58b63658894349088000d10bd2c659bf4d16d3065570f0cd3188cf559ce662cf0c921c0886deb62703dccea85fd04787e22c1ce2a150916bcd46ae48367de3c543c865fb70e511d0fe608a27f7121703993b536ca3379e0ebfc';
//     // console.log(dcorejs.CryptoUtils.decryptHexString(msg, 'Password1'));
//     // const dcoreAes = dcorejslib.Aes.fromSha512(cryptoJs.SHA512('password').toString(cryptoJs.enc.Hex));
//     const dcoreAes = dcorejslib.Aes.fromSeed('Password1');
//     console.log(dcoreAes.decryptHexToBuffer(msg).toString());
//     dcorejs.account().voteForMiners(
//         ['1.4.7', '1.4.8', '1.4.6'],
//         '1.2.27',
//         '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ')
//         .then(r => console.log(r));
//     dcorejs.account().unvoteMiners(
//         ['1.4.10'],
//         '1.2.27',
//         '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ')
//         .then(r => console.log(r));
//     dcorejs.account().getAccountById('1.2.27').then(r => console.log(r));
//     dcorejs.asset().createUserIssuedAsset(
//         '1.2.27',
//         'DUS',
//         0,
//         'duski token',
//         10000,
//         {
//             base:
//                 {
//                     amount: 200000000,
//                     asset_id: '1.3.0'
//                 },
//             quote:
//                 {
//                     amount: 1,
//                     asset_id: '1.3.1'
//                 }
//         },
//         true,
//         false,
//         '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ'
//     )
//         .then(res => console.log(res))
//         .catch(err => console.log(err));
//     dcorejs.asset().getRealSupply()
//         .then(res => console.log(res))
//         .catch(err => console.log(err));


    // const privateKey = '5KfaSt8mWyGcZXRk4HKmt77ERJsBQz8QXintiAvUFCMasL2KYTL';
    // const egPrivate = '9951482713110546910654770116549881133339951895578381605347713063259834535096323355559828047288475209595776035312706007755854990617069594416307472971521354';
    // const modulus = BigInteger.valueOf(11760620558671662461946567396662025495126946227619472274601251081547302009186313201119191293557856181195016058359990840577430081932807832465057884143546419);
    //
    // const pKey = dcorejs.Utils.privateKeyFromWif(privateKey);
    // // const byteBuffer = pKey.key.toBuffer();
    // // const bi = BigInteger.fromBuffer(byteBuffer);
    // // const ba = bi.toBuffer(32);
    // // const hash = dcorejs.CryptoUtils.sha512(ba.toString('hex'));
    // const pkeyHex = pKey.key.toHex();
    // const hash = dcorejs.CryptoUtils.sha512(pKey.key.toBuffer());
    // const hashBuffer = new Buffer(hash, 'hex');
    // const res1 = BigInteger.fromBuffer(hash);
    // const res2 = BigInteger.fromBuffer(hashBuffer);
    // const res = BigInteger.fromHex(hash);
    // const key = res1.modPowInt(1, modulus);
    // const nehehe = key.toByteArray();
    // console.log(pKey.stringKey);

    // dcorejs.mining().setDesiredMinerCount('1.2.27', 1, '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ').then(res => console.log(res)).catch(err => console.log(err));
    // dcorejs.account().voteForMiner('1.4.10', '1.2.27', '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ').then(res => console.log(res)).catch(err => console.log(err));
    // dcorejs.account().getAccountById('1.2.27').then(res => console.log(res)).catch(err => console.log(err));
    dcorejs.explorer().getMiner('9').then(res => console.log(res));
}
