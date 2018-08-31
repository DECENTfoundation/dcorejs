const contentId = '2.13.240';

describe('(client/integration) Content fetch', () => {
    it('add content', (done) => {
        finalizeAndBroadcast_content.resolves(true);
        fetchStub.resolves([accounts.all[0], accounts.all[0], accounts.all[1]]);
        executeStub.resolves([assets.dct_asset, assets.dct_asset]);

        const synopsis = {
            title: 'contentTesting',
            description: 'content test',
            content_type_id: '1.1.1.0',
        };
        const coAuth1 = accounts.all[0];
        const coAuth2 = accounts.all[1];
        const submitObject = {
            authorId: accountId,
            coAuthors: [
                [coAuth1, 1000],
                [coAuth2, 1000]
            ],
            seeders: [],
            fileName: '/home/katka/decent/dcorejs/contentTesting.txt',
            date: new Date().toISOString().split('.')[0].toString(),
            price: 0.0000001,
            size: 16,
            URI: 'ipfs',
            hash: dcorejs.Utils.ripemdHash('testString'),
            keyParts: [],
            synopsis: synopsis,
            assetId: '1.3.0',
            publishingFeeAsset: '1.3.0'
        };
        contentModule.addContent(submitObject, privateKey, false)
            .then(result => {
                const operation = result.operation;
                expect(operation.size).equals(1);
                expect(operation.author).equals(accountId);
                expect(operation.co_authors).length(2);
                expect(operation.URI).equals('ipfs');
                expect(operation.quorum).equals(0);
                done();
            })
            .catch(error => {
                console.log('Error: ', error);
                chai.assert.isDefined(error);
            });
    });

    it('buy content', (done) => {
        finalizeAndBroadcast_content.resolves(true);
        getContentStub.resolves(contentData.content);
        const elGammalPrivate = dcorejs.Utils.elGamalPrivate(privateKey);
        const elGammalPublic = dcorejs.Utils.elGamalPublic(elGammalPrivate);
        const buyerId = '1.2.62';
        const buyerPrivateKey = '5Jz3i2MEZNFJAFfRvJwTDtLULzoxmQH6aP7VKbQnc8ZrJa1K4qZ';
        const content = contentData.content;

        contentModule.buyContent(contentId, buyerId, elGammalPublic, buyerPrivateKey, false)
            .then(result => {
                const operation = result.operation;
                expect(operation.consumer).equals(buyerId);
                expect(operation.URI).equals(content.URI);
                expect(operation.pubKey.s).equals(elGammalPublic);
                done();
            })
            .catch(error => {
                console.log(error);
                chai.assert.isDefined(error);
            });
    });
});

