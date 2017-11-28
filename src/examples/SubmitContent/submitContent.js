'use strict';

get('submitButton').onclick = () => {
    onSubmit();
};

get('file').onchange = (event) => {
    file = event.target.files[0];
};

const dctPow = Math.pow(10, 8);
const chainId =
    '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const decentNetworkAddresses = ['wss://stage.decentgo.com:8090'];
const authorId = '1.2.30';
const privateKey = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';

decent.Decent.initialize({
    chain_id: chainId,
    decent_network_wspaths: decentNetworkAddresses
});

let file = null;
let seeders = [];

function getContentKeys(forSeeders) {
    return new Promise((resolve, reject) => {
        decent.Decent.core.content.generateContentKeys(forSeeders)
        .then(keys => {
            resolve(keys);
        })
        .catch(err => {
            reject(err);
        });
    });
}

function onSubmit() {
    console.log(get('expirationDate').value);
    decent.Decent.core.content.getSeeders(2).then(seeders => {
        console.log(seeders);
        getContentKeys(seeders.map(s => s.seeder))
        .then(keys => {
            const submitObject = {
                authorId: authorId,
                seeders: seeders,
                fileName: file.name,
                date: get('expirationDate').value + 'T00:00:00',
                price: get('price').value * dctPow,
                size: file.size,
                URI: get('uri').value,
                hash: get('hash').value,
                keyParts: keys.parts,
                synopsis: get('meta')
            };
            decent.Decent.core.content.addContent(submitObject, privateKey)
            .then(res => {
                console.log('success!!')
            })
            .catch(err => {
                console.log(err)
            });
        });
    });
    
}

function get(elementId) {
    return document.getElementById(elementId);
}

function selectSeeder(event) {
    console.log(id);
}

// authorId: string;
// seeders: Seeder[];
// fileName: string;
// fileContent: Buffer;
// date: string;
// fileSize: number;
// price: number;
// size: number;
// URI: string;
// hash: string;
// keyParts: KeyParts[];
// synopsis: any;
//# sourceMappingURL=searchContent.js.map
