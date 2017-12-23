"use strict";

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const decentNetworkAddresses = ['wss://stage.decentgo.com:8090'];

let decentjs_lib = window['decentjs-lib'];

decent.initialize({
    chain_id: chainId,
    decent_network_wspaths: decentNetworkAddresses
}, decentjs_lib);

const contentList = document.getElementById('contentList');
const contentDetail = document.getElementById('contentDetail');

let contentItems = [];

function getContent() {
    contentList.innerHTML = 'Loading ...';
    decent.content().searchContent(new decent.SearchParams())
        .then(content => {
            contentList.innerHTML = renderContent(content);
            contentItems = content;
        })
        .catch(err => {
            console.error(err);
            contentList.innerHTML = 'Error loading content';
        });
}

function renderContent(content) {
    let render = '<ul>';
     render += content.map(c => '<li onclick="showDetail(\'' + c.id + '\')"><a href="#">' + c.synopsis.title + '</a></li>');
     render += '</ul>';
     if (content.length === 0) {
         render = '<h3>No content</h3>';
     }
     return render
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
    contentDetail.innerHTML += JSON.stringify(item);
}

getContent();

//# sourceMappingURL=searchContent.js.map