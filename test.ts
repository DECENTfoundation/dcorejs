import * as dcorejs from './';
import * as fs from 'fs-extra';


const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];

process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

dcorejs.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, null, (state) => {
    if (state === 'open') {
        call();
    }
});

function call() {
    // dcorejs.account().createAccountWithBrainkey(
    //     'HAPTIC UNHARSH POSSESS MADDER TINNOCK CAMPLE FLOBBY WAVERY SHADINE DEBUT MUCKER PESETA BRISKET CANCER DISMAL NAEL',
    //     'duskis2',
    //     '1.2.292',
    //     '5KbJXmPP1ujvWMqNdiJnFKaDUaUMSnkrJdgVZvACuaVb4puKFDH')
    //     .then(res => console.log(res))
    //     .catch(err => console.log(err));
    dcorejs.account().getAccountByName('duskis2')
        .then(res => console.log(res))
        .catch(err => console.log(err));
    // dcorejs.account().registerAccount(
    //     'duskis2',
    //     'DCT71wnAP8PVWh5vVLUFtShW4iuJx76ueDU9Xuip8Ka8fhAg1uLVM',
    //     'DCT71wnAP8PVWh5vVLUFtShW4iuJx76ueDU9Xuip8Ka8fhAg1uLVM',
    //     'DCT71wnAP8PVWh5vVLUFtShW4iuJx76ueDU9Xuip8Ka8fhAg1uLVM',
    //     '1.2.292',
    //     '5KbJXmPP1ujvWMqNdiJnFKaDUaUMSnkrJdgVZvACuaVb4puKFDH')
    //     .then(res => console.log(res))
    //     .catch(err => console.log((err)));
}


