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
let finalizeAndBroadcast_account = sinon.stub(accountModule, 'finalizeAndBroadcast');
let finalizeAndBroadcast_content = sinon.stub(contentModule, 'finalizeAndBroadcast');
