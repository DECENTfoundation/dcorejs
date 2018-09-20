const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, false);

const el = id => document.getElementById(id);

const minerList = el('miner-list');
const minersNumber = el('desired-miner-number');
const output = el('output');

const accountId = '1.2.27';
const privateKey = '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ';

function render() {
    const render = [];
    infoMessage('Loading account...');
    getAccount(accountId)
        .then(account => {
            infoMessage('Loading miners...');
            getMiners()
                .then(miners => {
                    miners.forEach(miner => {
                        let item = getMinerItem(miner, isVoted(miner, account));
                        render.push(item);
                    });
                    minerList.innerHTML = render.join('');
                    correctMessage('');
                })
                .catch(err => {
                    errorMessage('Error loading miners');
                });
        })
        .catch(err => {
            errorMessage('Error: failed to load account');
        });
}

function voteButton(minerId) {
    return '<button class="vote-button" onclick="voteMiner(\'' + minerId + '\')">Vote</button>';
}

function unvoteButton(minerId) {
    return '<button class="vote-button" onclick="unvoteMiner(\'' + minerId + '\')">Unvote</button>';
}

function getMinerItem(miner, isVoted) {
    const button = isVoted ? unvoteButton(miner.id) : voteButton(miner.id);
    return '<li class="miner-list-item">' + miner.id + '' + button + '</li>';
}

function getAccount(accountId) {
    return dcore_js.account().getAccountById(accountId);
}

function getMiners() {
    return dcore_js.explorer().listMiners();
}

function isVoted(miner, account) {
    return account.options.votes.indexOf(miner.vote_id) >= 0;
}

function voteMiner(minerId) {
    return new Promise((resolve, reject) => {
        infoMessage('Voting...');
        dcore_js.account().voteForMiner(minerId, accountId, privateKey)
            .then(res => {
                correctMessage('Miner voted successfully');
                render();
                resolve();
            })
            .catch(err => {
                errorMessage('Error: Failed to vote for miner');
                reject();
            })
    });
}

function unvoteMiner(minerId) {
    return new Promise((resolve, reject) => {
        infoMessage('Unvoting...');
        dcore_js.account().unvoteMiner(minerId, accountId, privateKey)
            .then(res => {
                correctMessage('Miner unvoted successfully');
                render();
                resolve();
            })
            .catch(err => {
                errorMessage('Error: Failed to remove votes from miner');
                reject();
            })
    });
}

function setDesiredMinerNumber() {
    const desiredMinerNumber = minersNumber.value;
    infoMessage('Setting desired miners number...');
    dcore_js.mining().setDesiredMinerCount(accountId, Number(desiredMinerNumber), privateKey)
        .then(res => {
            correctMessage('Desired miners number has been successfully set');
        })
        .catch(err => {
            console.log(err.stack);
            errorMessage('Error: Operation failed');
        });
}

function correctMessage(message) {
    setOutput('<p style="color: green;">' + message + '</p>');
}

function errorMessage(message) {
    setOutput('<p style="color: red;">' + message + '</p>');
}

function infoMessage(message) {
    setOutput('<p>' + message + '</p>');
}

function setOutput(msg) {
    output.innerHTML = msg;
}

render();

