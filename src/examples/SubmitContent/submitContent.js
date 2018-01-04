'use strict';

const el = document.getElementById;

el('submitButton').onclick = () => {
    onSubmit();
};

el('file').onchange = (event) => {
    file = event.target.files[0];
};

el('categoryList').onchange = (event) => {
    onCategorySelect(event);
};

el('title').onchange = (event) => {
    onPropertyChange('title', event.target.value);
};

el('description').onchange = (event) => {
    onPropertyChange('description', event.target.value);
};

const output = el('output');
const categoryOut = el('categoryList');

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
const seeders = [];

function listCategories() {
    let render = '';
    categories.forEach(category => {
        render += '<option value="" disabled>' + category.name + '</option>';
        category.subcategory.forEach(subcat => {
            render += '<option value="' + subcat.id + '">' + subcat.name + '</option>';
        });
    });
    categoryOut.innerHTML = render;
}

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
    const [year, month, day] = el('expirationDate').value.split('-');
    const date = new Date(year, month, day, 0, 0, 0);
    decent.content().getSeeders(2).then(seeders => {
        const synopsis = JSON.parse(el('meta').value);
        getContentKeys(seeders.map(s => s.seeder))
            .then(keys => {
                const submitObject = {
                    authorId: authorId,
                    seeders: seeders,
                    fileName: file.name,
                    date: date.toString(),
                    price: el('price').value * dctPow,
                    size: file.size,
                    URI: el('uri').value,
                    hash: el('hash').value,
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

function onCategorySelect(event) {
    onPropertyChange('content_type_id', event.target.value + '.0');
}

function onPropertyChange(prop, value) {
    const meta = el('meta');
    const obj = JSON.parse(meta.value);
    obj[prop] = value;
    meta.value = JSON.stringify(obj);
}

listCategories();
