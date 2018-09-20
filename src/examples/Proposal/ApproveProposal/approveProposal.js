"use strict";

const el = id => document.getElementById(id);

el('searchButton').onclick = () => {
    const payingId = el('payingId').value;
    const proposalId = el('proposalId').value;
    const removeActive = el('removeActive').value;
    const addActive = el('addActive').value;
    const removeOwner = el('removeOwner').value;
    const addOwner = el('addOwner').value;
    const privateKey = el('privateKey').value;
    console.log(removeOwner);
    approveProposal(payingId, proposalId, removeActive, addActive, removeOwner, addOwner, privateKey);
};
const output = el('output');

const dcorejs_lib = window['dcorejs-lib'];
const dcore_js = window['dcorejs'];

// Lib initialization
const chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
const dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];

dcore_js.initialize({
    chainId: chainId,
    dcoreNetworkWSPaths: dcoreNetworkAddresses
}, false);

function approveProposal(payingId, proposalId, removeActive, addActive, removeOwner, addOwner, privateKey) {
    output.innerHTML = 'Loading ...';
    const activeApprovalsToAdd = addActive !== '' ? [addActive] : [];
    const activeApprovalsToRemove = removeActive !== '' ? [removeActive] : [];
    const ownerApprovalsToAdd = addOwner !== '' ? [addOwner] : [];
    const ownerApprovalsToRemove = removeOwner !== '' ? [removeOwner] : [];
    const approvals = {
        active_approvals_to_add: activeApprovalsToAdd,
        active_approvals_to_remove: activeApprovalsToRemove,
        owner_approvals_to_add: ownerApprovalsToAdd,
        owner_approvals_to_remove: ownerApprovalsToRemove,
        key_approvals_to_add: [],
        key_approvals_to_remove: []
    };
    dcore_js.proposal().approveProposal(payingId, proposalId, approvals, privateKey)
        .then(() => {
            output.innerHTML = 'Proposal approved';
        })
        .catch(err => {
            console.error(err);
            output.innerHTML = '<p style="color: red;">Error approving proposal</p>';
        });
}

//# sourceMappingURL=searchContent.js.map
