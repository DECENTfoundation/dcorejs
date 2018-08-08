// declarations of variables shared for all browser tests
const expect = chai.expect;
const dcorejs_lib = dcorejs.getLibRef();
chai.should();
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];
const bk = 'PADDLED PACE ATIMON PILLAGE VISTO IXODID CODFISH DANDLE MELA LATOMY NATES CUTTED SPIRAL BEGORRY BIOTAXY LIMPING';
const pub = 'DCT8cYDtKZvcAyWfFRusy6ja1Hafe9Ys4UPJS92ajTmcrufHnGgjp';
const priv = '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ';
const accountId = '1.2.27';
const refElGamalPrivate = '9951482713110546910654770116549881133339951895578381605347713063259834535096323355559828047288475209595776035312706007755854990617069594416307472971521354';
const refElGamalPublic = '1476592897265129256906985148863834019333244843526837587739241973266771272616315012971707289842820560922634174697696963038593504885326978206069960938313296';
const refPrivateKey = '5KfaSt8mWyGcZXRk4HKmt77ERJsBQz8QXintiAvUFCMasL2KYTL';
const dctAssetObject = {
    'id': '1.3.0',
    'symbol': 'DCT',
    'precision': 8,
    'issuer': '1.2.1',
    'description': '',
    'options': {
        'max_supply': '7319777577456900',
        'core_exchange_rate': {'base': {'amount': 1, 'asset_id': '1.3.0'}, 'quote': {'amount': 1, 'asset_id': '1.3.0'}},
        'is_exchangeable': true,
        'extensions': []
    },
    'dynamic_asset_data_id': '2.3.0'
};

let apiConnectorStub = sinon.stub(dcorejs.ApiConnector.prototype, 'connectApi').callsFake(() => new Promise(resolve => resolve()));
let apiConnector = new dcorejs.ApiConnector(dcoreNetworkAddresses, dcorejs_lib.Apis);
let chainApi = new dcorejs.ChainApi(apiConnector, dcorejs_lib.ChainStore);
let historyApi = new dcorejs.HistoryApi(dcorejs_lib.Apis, apiConnector);
let databaseApi = new dcorejs.DatabaseApi(dcorejs_lib.Apis, apiConnector);
let accountModule = new dcorejs.AccountModule(databaseApi, chainApi, historyApi, apiConnector);
let contentModule = new dcorejs.ContentModule(databaseApi, chainApi, apiConnector);
apiConnectorStub.restore();

let fetchStub = sinon.stub(chainApi, 'fetch');
let getAccountByIdStub = sinon.stub(accountModule, 'getAccountById');
let executeStub = sinon.stub(databaseApi, 'execute');
let getContentStub = sinon.stub(contentModule, 'getContent');
