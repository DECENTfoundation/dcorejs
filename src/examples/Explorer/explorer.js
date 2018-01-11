// import {Type} from "../../explorer";

const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const decentNetworkAddresses = ['wss://stage.decentgo.com:8090'];

const decentjs_lib = window['decentjs-lib'];


decent.initialize({
    chain_id: chainId,
    decent_network_wspaths: decentNetworkAddresses
}, decentjs_lib);

const el = id => document.getElementById(id);

const methodList = el('methodList');
const blockView = el('block');

methodList.onchange = (ev) => {
    listBlock(ev.target.value);
};

const availableMethods = {
    account: decent.Type.Protocol.account,
    asset: decent.Type.Protocol.asset,
    miner: decent.Type.Protocol.miner,
    operation_history: decent.Type.Protocol.operation_history,
    vesting_balance: decent.Type.Protocol.vesting_balance,
    global_property: decent.Type.Implementation.global_property,
    dynamic_global_property: decent.Type.Implementation.dynamic_global_property,
    asset_dynamic_data_type: decent.Type.Implementation.asset_dynamic_data_type,
    account_balance: decent.Type.Implementation.account_balance,
    account_statistics: decent.Type.Implementation.account_statistics,
    block_summary: decent.Type.Implementation.block_summary,
    account_transaction_history: decent.Type.Implementation.account_transaction_history,
    chain_property: decent.Type.Implementation.chain_property,
    miner_schedule: decent.Type.Implementation.miner_schedule,
    budget_record: decent.Type.Implementation.budget_record,
    buying: decent.Type.Implementation.buying,
    content: decent.Type.Implementation.content,
    publisher: decent.Type.Implementation.publisher,
    subscription: decent.Type.Implementation.subscription,
    seeding_statistics: decent.Type.Implementation.seeding_statistics,
    transaction_detail: decent.Type.Implementation.transaction_detail
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
        case decent.Type.Protocol.account :
            getAccount();
            break;
        case decent.Type.Protocol.asset :
            getAsset();
            break;
        case decent.Type.Protocol.miner :
            getWitness();
            break;
        case decent.Type.Protocol.operation_history :
            getOperationHistory();
            break;
        case decent.Type.Protocol.vesting_balance :
            getVestingBalance();
            break;
        case decent.Type.Implementation.global_property :
            getGlobalProperty();
            break;
        case decent.Type.Implementation.dynamic_global_property :
            getDynamicGlobalProperty();
            break;
        case decent.Type.Implementation.asset_dynamic_data_type :
            getAssetDynamicDataType();
            break;
        case decent.Type.Implementation.account_balance :
            getAccountBalance();
            break;
        case decent.Type.Implementation.account_statistics :
            getAccountStatistics();
            break;
        case decent.Type.Implementation.block_summary :
            getBlockSummary();
            break;
        case decent.Type.Implementation.account_transaction_history :
            getAccountTransactionHistory();
            break;
        case decent.Type.Implementation.chain_property :
            getChainProperty();
            break;
        case decent.Type.Implementation.miner_schedule :
            getWitnessSchedule();
            break;
        case decent.Type.Implementation.budget_record :
            getBudgetRecord();
            break;
        case decent.Type.Implementation.buying :
            getBuying();
            break;
        case decent.Type.Implementation.content :
            getContent();
            break;
        case decent.Type.Implementation.publisher :
            getPublisher();
            break;
        case decent.Type.Implementation.subscription :
            getSubscription();
            break;
        case decent.Type.Implementation.seeding_statistics :
            getSeedingStatistics();
            break;
        case decent.Type.Implementation.transaction_detail :
            getTransactionDetail();
            break;
        default:
            break;
    }
}

function getAccount() {
    decent.explorer().getAccount('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getAsset() {
    decent.explorer().getAsset('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getWitness() {
    decent.explorer().getWitness('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getOperationHistory() {
    decent.explorer().getOperationHistory('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getVestingBalance() {
    decent.explorer().getVestingBalance('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getGlobalProperty() {
    decent.explorer().getGlobalProperty('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getDynamicGlobalProperty() {
    decent.explorer().getDynamicGlobalProperty('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getAssetDynamicDataType() {
    decent.explorer().getAssetDynamicDataType('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getAccountBalance() {
    decent.explorer().getAccountBalance('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getAccountStatistics() {
    decent.explorer().getAccountStatistics('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getBlockSummary() {
    decent.explorer().getBlockSummary('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getAccountTransactionHistory() {
    decent.explorer().getAccountTransactionHistory('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getChainProperty() {
    decent.explorer().getChainProperty('0').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getWitnessSchedule() {
    decent.explorer().getWitnessSchedule('0').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getBudgetRecord() {
    decent.explorer().getBudgetRecord('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getBuying() {
    decent.explorer().getBuying('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getContent() {
    decent.explorer().getContent('22').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getPublisher() {
    decent.explorer().getPublisher('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getSubscription() {
    decent.explorer().getSubscription('0').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getSeedingStatistics() {
    decent.explorer().getSeedingStatistics('1').then(res => {
        block = res;
        renderBlock(block);
    });
}

function getTransactionDetail() {
    decent.explorer().getTransactionDetail('22').then(res => {
        block = res;
        renderBlock(block);
    });
}