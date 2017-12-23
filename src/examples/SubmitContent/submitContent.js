'use strict';

get('submitButton').onclick = () => {
    onSubmit();
};

get('file').onchange = (event) => {
    file = event.target.files[0];
};

const output = get('output');

const dctPow = Math.pow(10, 8);
const chainId =
    '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const decentNetworkAddresses = ['wss://stage.decentgo.com:8090'];
const authorId = '1.2.30';
const privateKey = '5JDFQN3T8CFT1ynhgd5s574mTV9UPf9WamkHojBL4NgbhSBDmBj';

const decentjs_lib = window['decentjs-lib'];

decent.initialize({
    chain_id: chainId,
    decent_network_wspaths: decentNetworkAddresses
}, decentjs_lib);

let file = null;
let seeders = [];

function getContentKeys(forSeeders) {
    return new Promise((resolve, reject) => {
        decent.content().generateContentKeys(forSeeders)
        .then(keys => {
            resolve(keys);
        })
        .catch(err => {
            reject(err);
        });
    });
}

function onSubmit() {
    output.innerHTML = 'Submitting...';
    const [year, month, day] = get('expirationDate').value.split('-');
    const date = new Date(year, month, day, 0, 0, 0);
    decent.content().getSeeders(2).then(seeders => {
        const synopsis = JSON.parse(get('meta').value);
        getContentKeys(seeders.map(s => s.seeder))
        .then(keys => {
            const submitObject = {
                authorId: authorId,
                seeders: seeders,
                fileName: file.name,
                date: date.toString(),
                price: get('price').value * dctPow,
                size: file.size,
                URI: get('uri').value,
                hash: get('hash').value,
                keyParts: keys.parts,
                synopsis: synopsis
            };
            
            decent.content().addContent(submitObject, privateKey)
            .then(res => {
                output.innerHTML = '<h3 style="color: green;">Content sucessfully submitted</h3>'
            })
            .catch(err => {
                output.innerHTML = '<h3 style="color: red;">!!! Error submitting content</h3>'
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
