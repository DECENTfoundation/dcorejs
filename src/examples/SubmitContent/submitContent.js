'use strict';

const el = id => document.getElementById(id);

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
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];
const authorId = '1.2.27';
const privateKey = '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ';

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, dcorejs_lib);

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
        dcore_js.content().generateContentKeys(forSeeders)
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
    dcore_js.content().getSeeders(2).then(seeders => {
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

                dcore_js.content().addContent(submitObject, privateKey)
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
