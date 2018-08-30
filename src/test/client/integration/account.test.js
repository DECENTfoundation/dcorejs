const accountName = 'u5d42a7b0b5713396aac58019eed01d53';
const privateKey = '5JdZfU9Ni7wopN8JPLPM2SJBkKWB19XJSR4mK27Ww7kyZAidJ1M';
const transactionId = '1.7.190';

describe('(client/integration) Account module', () => {
    it('transfer asset', (done) => {
        finalizeAndBroadcast_account.resolves(true);
        const accountFrom = accounts.all[0];
        const accountTo = accounts.all[1];
        const operationMock = {
            from: accountFrom.id,
            to: accountTo.id,
            amount: { asset_id: '1.3.0', amount: 10 },
            memo: {
                from: accountFrom.options.memo_key,
                to: accountTo.options.memo_key,
            },
            fee: { amount: 0, asset_id: 0 }
        };
        fetchStub.resolves([accountFrom, accountTo, assets.dct_asset]);
        accountModule.transfer(
            0.0000001, 
            '1.3.0', 
            '1.2.27', 
            '1.2.24', 
            '', 
            '5KcA6ky4Hs9VoDUSdTF4o3a7QDgiiG5gkpLLysRWR8dy6EAgTnZ', 
            false)
            .then((res) => {
                const operation = res.operation;
                expect(operation.from).to.equals(operationMock.from);
                expect(operation.to).to.equals(operationMock.to);
                expect(operation.amount).to.eql(operationMock.amount);
                expect(operation.memo.from).to.equals(operationMock.memo.from);
                expect(operation.memo.to).to.equals(operationMock.memo.to);
                expect(JSON.stringify(operation.amount)).to.equals(JSON.stringify(operationMock.amount));
                done();
            })
            .catch(err => {
                expect(err).to.be.a('number');
                done();
            });
    }).timeout(10000);

    it('register account', (done) => {
        finalizeAndBroadcast_account.resolves(true);
        const accountFrom = accounts.all[0];
        const ownerKey = accountFrom.owner.key_auths[0][0];
        const activeKey = accountFrom.active.key_auths[0][0];
        const memoKey = accountFrom.options.memo_key;
        const accountId = '1.2.27';
        const accountName = Date.now().toString();
        const operationMock = {
            name: accountName,
            owner: Object.assign({}, accountFrom.owner),
            active: Object.assign({}, accountFrom.active),
            options: {
                memo_key: memoKey,
                voting_account: '1.2.3',
                allow_subscription: false,
                price_per_subscribe: { amount: 0, asset_id: '1.3.0' },
                num_miner: 0,
                votes: [],
                extensions: [],
                subscription_period: 0,
            },
            registrar: accountFrom.id,
        };
        accountModule.registerAccount(accountName, ownerKey, activeKey, memoKey, accountId, privateKey, false)
            .then(result => {
                const operation = result.operation;
                expect(operation.name).to.equals(operationMock.name);
                expect(operation.owner).to.eql(operationMock.owner);
                expect(operation.active).to.eql(operationMock.active);
                expect(operation.options).to.eql(operationMock.options);
                expect(operation.registrar).to.equals(operationMock.registrar);
                done();
            })
            .catch(err => {
                console.log('Error: ', err);
                chai.assert.isDefined(err);
            });
    });

    it('update account', (done) => {
        finalizeAndBroadcast_account.resolves(true);
        getAccountByIdStub.resolves(accounts.all[0]);
        const accountFrom = accounts.all[0];
        const numMiner = 3;
        const params = {
            newNumMiner: numMiner,
        };
        const operationMock = {
            account: accountId,
            new_options: {
                memo_key: accountFrom.options.memo_key,
                voting_account: accountFrom.options.voting_account,
                num_miner: numMiner,
                votes: accountFrom.options.votes,
                extensions: accountFrom.options.extensions,
                allow_subscription: accountFrom.options.allow_subscription,
                price_per_subscribe: Object.assign({}, accountFrom.options.price_per_subscribe),
                subscription_period: accountFrom.options.subscription_period,
            },
            extensions: {},
            fee: { amount: 0, asset_id: 0 },
        };
        accountModule.updateAccount(accountFrom.id, params, privateKey, false)
            .then(result => {
                const operation = result.operation;
                expect(JSON.stringify(operation)).to.eql(JSON.stringify(operationMock));
                done();
            })
            .catch(err => {
                console.log('Error: ', err);
                chai.assert.isDefined(err);
            });
    });
});

