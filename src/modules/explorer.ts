import {DatabaseApi} from '../api/database';
import {Account} from '../model/account';
import {DatabaseOperations} from '../api/model/database';
import {Block, Miner, Space, Type} from '../model/explorer';
import {ApiModule} from './ApiModule';

export class ExplorerModule extends ApiModule {
    constructor(databaseApi: DatabaseApi) {
        super(databaseApi);
    }

    private async getDatabaseObject<T>(space: Space, type: Type.Implementation | Type.Protocol, id: number): Promise<T | null> {
        const operation = new DatabaseOperations.GetObjects([`${space}.${type}.${id}`]);
        try {
            const objects: Array<any> = await this.dbApi.execute(operation);
            if (objects.length > 0) {
                return objects[0];
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    getObject(objectId: string): Promise<any> {
        const operation = new DatabaseOperations.GetObjects([objectId]);
        return new Promise((resolve, reject) => {
            this.dbApi.execute(operation)
                .then(res => {
                    if (res.length > 0) {
                        resolve(res[0]);
                    } else {
                        resolve(null);
                    }
                })
                .catch(err => {
                    reject(err);
                });
        });
    }

    getAccount(id: number): Promise<Account> {
        return this.getDatabaseObject<any>(Space.protocol_ids, Type.Protocol.account, id);
    }

    getAsset(id: number): Promise<Block.Asset> {
        return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.asset, id);
    }

    getWitness(id: number): Promise<Block.Witness> {
        return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.miner, id);
    }

    getOperationHistory(id: number): Promise<Block.Transaction> {
        return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.operation_history, id);
    }

    getVestingBalance(id: number): Promise<Block.VestingBalance> {
        return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.vesting_balance, id);
    }

    getGlobalProperty(): Promise<Block.GlobalProperty> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.global_property, 0);
    }

    getDynamicGlobalProperty(): Promise<Block.DynamicGlobalProperty> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.dynamic_global_property, 0);
    }

    getAssetDynamicDataType(id: number): Promise<Block.AssetDynamicProperty> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.asset_dynamic_data_type, id);
    }

    getAccountBalance(id: number): Promise<Block.AccountBalance> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.account_balance, id);
    }

    getAccountStatistics(id: number): Promise<Block.AccountStatistics> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.account_statistics, id);
    }

    getBlockSummary(id: number): Promise<Block.BlockSummary> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.block_summary, id);
    }

    getAccountTransactionHistory(id: number): Promise<Block.AccountTransactionHistory> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.account_transaction_history, id);
    }

    getChainProperty(id: number): Promise<Block.ChainProperty> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.chain_property, id);
    }

    getWitnessSchedule(id: number): Promise<Block.WitnessSchedule> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.miner_schedule, id);
    }

    getBudgetRecord(id: number): Promise<Block.BudgetReport> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.budget_record, id);
    }

    getBuying(id: number): Promise<Block.Buying> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.buying, id);
    }

    getContent(id: number): Promise<Block.Content> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.content, id);
    }

    getPublisher(id: number): Promise<Block.Publisher> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.publisher, id);
    }

    getSubscription(id: number): Promise<Block.Subscription> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.subscription, id);
    }

    getSeedingStatistics(id: number): Promise<Block.SeedingStatistics> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.seeding_statistics, id);
    }

    getTransactionDetail(id: number): Promise<Block.TransactionDetail> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.transaction_detail, id);
    }

    getBlock(id: number): Promise<Block.Block> {
        const operation = new DatabaseOperations.GetBlock(id);
        return this.dbApi.execute(operation);
    }

    getBlocks(id: number, count: number): Promise<Array<Block.Block>> {
        const promises = [];
        for (let i = 0; i < count; i++) {
            promises.push(this.getBlock(i));
        }
        return Promise.all(promises);
    }

    getAccountCount(): Promise<number> {
        const operation = new DatabaseOperations.GetAccountCount();
        return this.dbApi.execute(operation);
    }

    getAccounts(...ids: number[]): Promise<Array<Account>> {
        const operation = new DatabaseOperations.GetAccounts(ids.map(id => `${Space.protocol_ids}.${Type.Protocol.account}.${id}`));
        return this.dbApi.execute(operation);
    }

    getTransaction(blockNo: number, txNum: number): Promise<Block.Transaction> {
        const operation = new DatabaseOperations.GetTransaction(blockNo, txNum);
        return this.dbApi.execute(operation);
    }

    listMiners(fromId: string = '0.0.0', limit: number = 100): Promise<Array<Miner>> {
        return new Promise((resolve, reject) => {
            const operation = new DatabaseOperations.LookupMiners(fromId, limit);
            this.dbApi.execute(operation)
                .then((res: [string, string][]) => {
                    const ids = res.map(el => Number(el[1].split('.')[2]));
                    this.getMiners(ids)
                        .then(res => {
                            resolve(res);
                        })
                        .catch(err => reject(err));
                })
                .catch(err => reject(err));
        });
    }

    getMiners(ids: number[]): Promise<Array<Miner>> {
        const op = new DatabaseOperations.GetMiners(ids.map(el => `${Space.protocol_ids}.${Type.Protocol.miner}.${el}`));
        return new Promise<Array<Miner>>((resolve, reject) => {
            this.dbApi.execute(op)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    getMiner(id: number): Promise<Miner|null> {
        return new Promise<Miner>((resolve, reject) => {
            this.getMiners([id])
                .then(res => {
                    resolve(res.length > 0 ? res[0] : null);
                })
                .catch(err => reject(err));
        });
    }

    getMinerCount(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const operation = new DatabaseOperations.GetMinerCount();
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    getHeadBlockTime(): Promise<string> {
        return new Promise<any>((resolve, reject) => {
            this.getDynamicGlobalProperty()
                .then(res => resolve(res.time))
                .catch(err => reject(err));
        });
    }
}
