import * as chai from 'chai';
import * as sinon from 'sinon';
import { SubmitObject, Synopsis } from '../../../model/content';
import { BuyContentType, SubmitContentType } from '../../../model/operationPrototype';
import { ApiConnector } from '../../../api/apiConnector';
import { ChainApi } from '../../../api/chain';
import { HistoryApi } from '../../../api/history';
import { DatabaseApi } from '../../../api/database';
import { ContentModule } from '../../../modules/content';
import { getLibRef } from '../../../helpers';
import { Utils } from '../../../utils';

const expect = chai.expect;
chai.should();
chai.config.showDiff = false;
const dcorejs_lib = getLibRef();

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];
const accountId = '1.2.27';
const privateKey = '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ';
const contentId = '2.13.240';

// turn off unverified certificate rejection
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';

let apiConnector: ApiConnector;
let chainApi: ChainApi;
let historyApi: HistoryApi;
let databaseApi: DatabaseApi;
let contentModule: ContentModule;
const accounts = require('./fixtures/accounts.json');
const assets = require('./fixtures/assets.json');
const contentData = require('./fixtures/content.json');

before(() => {
    this.apiConnector = sinon.stub(ApiConnector.prototype, 'connectApi').callsFake(() => new Promise(resolve => resolve()));
    apiConnector = new ApiConnector(dcoreNetworkAddresses, dcorejs_lib.Apis);
    chainApi = new ChainApi(apiConnector, dcorejs_lib.ChainStore);
    historyApi = new HistoryApi(dcorejs_lib.Apis, apiConnector);
    databaseApi = new DatabaseApi(dcorejs_lib.Apis, apiConnector);
    contentModule = new ContentModule(databaseApi, chainApi, apiConnector);
    this.apiConnector.restore();
});

beforeEach(() => {
    this.fetch = sinon.stub(chainApi, 'fetch');
    this.execute = sinon.stub(databaseApi, 'execute');
    this.getContent = sinon.stub(contentModule, 'getContent');
    this.finalizeAndBroadcast = sinon.stub(contentModule, 'finalizeAndBroadcast');
});

afterEach(() => {
    this.fetch.restore();
    this.execute.restore();
    this.getContent.restore();
    this.finalizeAndBroadcast.restore();
});

describe('(server/integration) Content fetch', () => {
    it('add content', (done) => {
        this.finalizeAndBroadcast.resolves(true);
        this.fetch.resolves([accounts.all[0], accounts.all[0], accounts.all[1]]);
        this.execute.resolves([assets.dct_asset, assets.dct_asset]);

        const synopsis: Synopsis = {
            title: 'contentTesting',
            description: 'content test',
            content_type_id: '1.1.1.0',
        };
        const coAuth1 = accounts.all[0];
        const coAuth2 = accounts.all[1];
        const submitObject: SubmitObject = {
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
            hash: Utils.ripemdHash('testString'),
            keyParts: [],
            synopsis: synopsis,
            assetId: '1.3.0',
            publishingFeeAsset: '1.3.0'
        };
        contentModule.addContent(submitObject, privateKey, false)
            .then(result => {
                const operation: SubmitContentType = result.operation as SubmitContentType;
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
        this.finalizeAndBroadcast.resolves(true);
        this.getContent.resolves(contentData.content);
        const elGammalPrivate = Utils.elGamalPrivate(privateKey);
        const elGammalPublic = Utils.elGamalPublic(elGammalPrivate);
        const buyerId = '1.2.62';
        const buyerPrivateKey = '5Jz3i2MEZNFJAFfRvJwTDtLULzoxmQH6aP7VKbQnc8ZrJa1K4qZ';
        const content = contentData.content;

        contentModule.buyContent(contentId, buyerId, elGammalPublic, buyerPrivateKey, false)
            .then(result => {
                const operation: BuyContentType = result.operation as BuyContentType;
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

