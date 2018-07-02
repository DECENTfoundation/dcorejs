// import {Type} from "../../explorer";

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, dcorejs_lib);

const el = id => document.getElementById(id);

const methodList = el('methodList');
const blockView = el('block');

methodList.onchange = (ev) => {
    listBlock(ev.target.value);
};

const availableMethods = {
    account: dcore_js.Type.Protocol.account,
    asset: dcore_js.Type.Protocol.asset,
    miner: dcore_js.Type.Protocol.miner,
    operation_history: dcore_js.Type.Protocol.operation_history,
    vesting_balance: dcore_js.Type.Protocol.vesting_balance,
    global_property: dcore_js.Type.Implementation.global_property,
    dynamic_global_property: dcore_js.Type.Implementation.dynamic_global_property,
    asset_dynamic_data_type: dcore_js.Type.Implementation.asset_dynamic_data_type,
    account_balance: dcore_js.Type.Implementation.account_balance,
    account_statistics: dcore_js.Type.Implementation.account_statistics,
    block_summary: dcore_js.Type.Implementation.block_summary,
    account_transaction_history: dcore_js.Type.Implementation.account_transaction_history,
    chain_property: dcore_js.Type.Implementation.chain_property,
    miner_schedule: dcore_js.Type.Implementation.miner_schedule,
    budget_record: dcore_js.Type.Implementation.budget_record,
    buying: dcore_js.Type.Implementation.buying,
    content: dcore_js.Type.Implementation.content,
    publisher: dcore_js.Type.Implementation.publisher,
    subscription: dcore_js.Type.Implementation.subscription,
    seeding_statistics: dcore_js.Type.Implementation.seeding_statistics,
    transaction_detail: dcore_js.Type.Implementation.transaction_detail
};

function renderMethods() {
    const render = [];
    render.push('<option value=""> --- </option>');
    for (const key in availableMethods) {
        render.push('<option value="' + availableMethods[key] + '">' + key + '</option>');
    }
    methodList.innerHTML = render.join('');
}

function renderBlock(block) {
    console.log(JSON.stringify(block, null, 2));
    blockView.innerHTML = JSON.stringify(block, null, 2);
}

renderMethods();

function listBlock(selectedValue) {
    blockView.innerHTML = 'Loading ... ';
    switch (Number(selectedValue)) {
        case dcore_js.Type.Protocol.account :
            getAccount();
            break;
        case dcore_js.Type.Protocol.asset :
            getAsset();
            break;
        case dcore_js.Type.Protocol.miner :
            getWitness();
            break;
        case dcore_js.Type.Protocol.operation_history :
            getOperationHistory();
            break;
        case dcore_js.Type.Protocol.vesting_balance :
            getVestingBalance();
            break;
        case dcore_js.Type.Implementation.global_property :
            getGlobalProperty();
            break;
        case dcore_js.Type.Implementation.dynamic_global_property :
            getDynamicGlobalProperty();
            break;
        case dcore_js.Type.Implementation.asset_dynamic_data_type :
            getAssetDynamicDataType();
            break;
        case dcore_js.Type.Implementation.account_balance :
            getAccountBalance();
            break;
        case dcore_js.Type.Implementation.account_statistics :
            getAccountStatistics();
            break;
        case dcore_js.Type.Implementation.block_summary :
            getBlockSummary();
            break;
        case dcore_js.Type.Implementation.account_transaction_history :
            getAccountTransactionHistory();
            break;
        case dcore_js.Type.Implementation.chain_property :
            getChainProperty();
            break;
        case dcore_js.Type.Implementation.miner_schedule :
            getWitnessSchedule();
            break;
        case dcore_js.Type.Implementation.budget_record :
            getBudgetRecord();
            break;
        case dcore_js.Type.Implementation.buying :
            getBuying();
            break;
        case dcore_js.Type.Implementation.content :
            getContent();
            break;
        case dcore_js.Type.Implementation.publisher :
            getPublisher();
            break;
        case dcore_js.Type.Implementation.subscription :
            getSubscription();
            break;
        case dcore_js.Type.Implementation.seeding_statistics :
            getSeedingStatistics();
            break;
        case dcore_js.Type.Implementation.transaction_detail :
            getTransactionDetail();
            break;
        default:
            break;
    }
}

function getAccount() {
    dcore_js.explorer().getAccount('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getAsset() {
    dcore_js.explorer().getAsset('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getWitness() {
    dcore_js.explorer().getWitness('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getOperationHistory() {
    dcore_js.explorer().getOperationHistory('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getVestingBalance() {
    dcore_js.explorer().getVestingBalance('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getGlobalProperty() {
    dcore_js.explorer().getGlobalProperty('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getDynamicGlobalProperty() {
    dcore_js.explorer().getDynamicGlobalProperty('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getAssetDynamicDataType() {
    dcore_js.explorer().getAssetDynamicDataType('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getAccountBalance() {
    dcore_js.explorer().getAccountBalance('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getAccountStatistics() {
    dcore_js.explorer().getAccountStatistics('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getBlockSummary() {
    dcore_js.explorer().getBlockSummary('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getAccountTransactionHistory() {
    dcore_js.explorer().getAccountTransactionHistory('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getChainProperty() {
    dcore_js.explorer().getChainProperty('0').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getWitnessSchedule() {
    dcore_js.explorer().getWitnessSchedule('0').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getBudgetRecord() {
    dcore_js.explorer().getBudgetRecord('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getBuying() {
    dcore_js.explorer().getBuying('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getContent() {
    dcore_js.explorer().getContent('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getPublisher() {
    dcore_js.explorer().getPublisher('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getSubscription() {
    dcore_js.explorer().getSubscription('0').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getSeedingStatistics() {
    dcore_js.explorer().getSeedingStatistics('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getTransactionDetail() {
    dcore_js.explorer().getTransactionDetail('22').then(res => {
        block = res;
        renderBlock(block);
    });
}