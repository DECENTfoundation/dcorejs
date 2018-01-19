"use strict";

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stage.decentgo.com:8090'];

const dcore = window['dcore'];
const dcore_js = window['dcore-js'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, dcore);

const el = id => document.getElementById(id);

const contentList = el('contentList');
const contentDetail = el('contentDetail');

const contentItems = [];

contentList.innerHTML = 'Loading ...';
dcore_js.content().searchContent(new dcore_js.SearchParams())
    .then(content => {
        contentList.innerHTML = renderContent(content);
        contentItems.push(...content);
    })
    .catch(err => {
        console.error(err);
        contentList.innerHTML = 'Error loading content';
    });

function renderContent(content) {
    const render = [];
    if (content.length === 0) {
        render.push('<h3>No content</h3>');
    } else {
        render.push('<ul>');
        render.push(content.map(c => '<li onclick="showDetail(\'' + c.id + '\')"><a href="#">' + c.synopsis.title + '</a></li>'));
        render.push('</ul>');
    }
    return render.join('');
}

function showDetail(itemId) {
    contentDetail.innerHTML = '';
    const item = contentItems.find(i => itemId === i.id);
    contentDetail.innerHTML += '<h3>Title: ' + item.synopsis.title + '</h3>';
    contentDetail.innerHTML += '<h4>Id: ' + item.id + '</h4>';
    contentDetail.innerHTML += '<h4>Author: ' + item.author + '</h4>'
    contentDetail.innerHTML += '<p>Description: ' + item.synopsis.description + '</p>';
    contentDetail.innerHTML += '<h4>Price: ' + item.price.amount + '</h4>';
    contentDetail.innerHTML += '<h4>Expiration: ' + item.expiration + '</h4>';
    contentDetail.innerHTML += JSON.stringify(item, null, 2);
}

//# sourceMappingURL=searchContent.js.map