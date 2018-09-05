"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const keyword = el('keyword').value;
    searchContent(keyword);
};

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, false);

const output = el('output');

function searchContent(keyword) {
    output.innerHTML = 'Loading ...';
    dcore_js.content().searchContent()
        .then(content => {
            output.innerHTML = renderContent(content);
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = 'Error loading content';
        });
}

function renderContent(content) {
    const render = [];

    if (content.length === 0) {
        render.push('<h3>No content</h3>');
    } else {
        render.push('<ul>');
        render.push(content.map(c => '<li>' + c.synopsis.title + '</li>'));
        render.push('</ul>');
    }
    return render.join('');
}

//# sourceMappingURL=searchContent.js.map
