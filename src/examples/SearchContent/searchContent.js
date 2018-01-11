"use strict";

const el = document.getElementById.bind(document);

el('searchButton').onclick = () => {
    const keyword = el('keyword').value;
    searchContent(keyword);
};

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const decentNetworkAddresses = ['wss://stage.decentgo.com:8090'];

const decentjs_lib = window['decentjs-lib'];


decent.initialize({
    chain_id: chainId,
    decent_network_wspaths: decentNetworkAddresses
}, decentjs_lib);

const output = el('output');

function searchContent(keyword) {
    output.innerHTML = 'Loading ...';
    decent.content().searchContent(new decent.SearchParams(keyword))
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