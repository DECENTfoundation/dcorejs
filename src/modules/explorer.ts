import {DatabaseApi} from '../api/database';
import {Account} from '../model/account';
import {DatabaseOperations} from '../api/model/database';
import {Block, Miner, Space, Type} from '../model/explorer';
import {ApiModule} from './ApiModule';

export class ExplorerModule extends ApiModule {
    constructor(databaseApi: DatabaseApi) {
        super({
            dbApi: databaseApi
        });
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

    /**
     * Get object from DCore network
     *
     * @param {string} objectId     Object id. In format 'X.Y.Z'.
     * @returns {Promise<any>}      Desired object.
     */
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

    /**
     * Get account object.
     *
     * @param {number} id           Account id, last part of id -> X from '1.2.X'.
     * @returns {Promise<Account>}  Account object.
     */
    getAccount(id: number): Promise<Account> {
        return this.getDatabaseObject<any>(Space.protocol_ids, Type.Protocol.account, id);
    }

    /**
     * Get asset object.
     *
     * @param {number} id               Asset id, last part of id -> X from '1.3.X'.
     * @returns {Promise<Block.Asset>}  Asset object.
     */
    getAsset(id: number): Promise<Block.Asset> {
        return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.asset, id);
    }

    /**
     * Get miner object.
     *
     * @param {number} id               Miner id, last part of id -> X from '1.4.X'.
     * @returns {Promise<Block.Miner>}  Miner object.
     */
    getWitness(id: number): Promise<Block.Miner> {
        return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.miner, id);
    }

    /**
     * Get list of history objects.
     * @param {number} id                       History object id, last part of id -> X from '1.7.X'.
     * @returns {Promise<Block.Transaction>}
     */
    getOperationHistory(id: number): Promise<Block.Transaction> {
        return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.operation_history, id);
    }

    /**
     * Get vesting balance object.
     *
     * @param {number} id                       Vesting balance id, last part of id -> X from '1.9.X'.
     * @returns {Promise<Block.VestingBalance>}
     */
    getVestingBalance(id: number): Promise<Block.VestingBalance> {
        return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.vesting_balance, id);
    }

    /**
     * Get DCore network global properties object.
     *
     * @returns {Promise<Block.GlobalProperty>}     GlobalProperty object.
     */
    getGlobalProperty(): Promise<Block.GlobalProperty> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.global_property, 0);
    }

    /**
     * Get DCore network dynamic properties object.
     *
     * @returns {Promise<Block.DynamicGlobalProperty>}  DynamicGlobalProperty object.
     */
    getDynamicGlobalProperty(): Promise<Block.DynamicGlobalProperty> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.dynamic_global_property, 0);
    }

    /**
     * Get asset dynamic data property object.
     *
     * @param {number} id                               Asset balance id, last part of id -> X from '2.3.X'.
     * @returns {Promise<Block.AssetDynamicProperty>}   AssetDynamicProperty object.
     */
    getAssetDynamicDataType(id: number): Promise<Block.AssetDynamicProperty> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.asset_dynamic_data_type, id);
    }

    /**
     * Get account balance object.
     *
     * @param {number} id                           Account balance id, last part of id -> X from '2.4.X'.
     * @returns {Promise<Block.AccountBalance>}     AccountBalance object.
     */
    getAccountBalance(id: number): Promise<Block.AccountBalance> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.account_balance, id);
    }

    /**
     * Get account statistics object.
     *
     * @param {number} id                           Account statistics id, last part of id -> X from '2.5.X'.
     * @returns {Promise<Block.AccountStatistics>}  AccountStatistics object.
     */
    getAccountStatistics(id: number): Promise<Block.AccountStatistics> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.account_statistics, id);
    }

    /**
     * Get block summary object.
     *
     * @param {number} id                       Block summary id, last part of id -> X from '2.7.X'.
     * @returns {Promise<Block.BlockSummary>}
     */
    getBlockSummary(id: number): Promise<Block.BlockSummary> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.block_summary, id);
    }

    /**
     * Get list of account's transaction history objects.
     *
     * @param {number} id                                   Account transaction history id, last part of id -> X from '2.8.X'.
     * @returns {Promise<Block.AccountTransactionHistory>}  List of account transaction history objects.
     */
    getAccountTransactionHistory(id: number): Promise<Block.AccountTransactionHistory> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.account_transaction_history, id);
    }

    /**
     * Get chain property.
     *
     * @param {number} id                       Account transaction history id, last part of id -> X from '2.9.X'.
     * @returns {Promise<Block.ChainProperty>}  ChainProperty object.
     */
    getChainProperty(id: number): Promise<Block.ChainProperty> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.chain_property, id);
    }

    /**
     * Get miner's schedule object.
     *
     * @param {number} id                       Miner schedule id, last part of id -> X from '2.10.X'.
     * @returns {Promise<Block.MinerSchedule>}  Miner schedule object.
     */
    getMinerSchedule(id: number): Promise<Block.MinerSchedule> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.miner_schedule, id);
    }

    /**
     * Get budget record object
     *
     * @param {number} id                       Budget record id, last part of id -> X from '2.11.X'.
     * @returns {Promise<Block.BudgetReport>}   Budget record object.
     */
    getBudgetRecord(id: number): Promise<Block.BudgetReport> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.budget_record, id);
    }

    /**
     * Get buying object.
     *
     * @param {number} id                   Buying object id, last part of id -> X from '2.12.X'.
     * @returns {Promise<Block.Buying>}     Buying object.
     */
    getBuying(id: number): Promise<Block.Buying> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.buying, id);
    }

    /**
     * Get content object.
     *
     * @param {number} id                   Content object id, last part of id -> X from '2.13.X'.
     * @returns {Promise<Block.Content>}    Content object.
     */
    getContent(id: number): Promise<Block.Content> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.content, id);
    }

    /**
     * Get publisher object.
     *
     * @param {number} id                   Publisher id, last part of id -> X from '2.14.X'.
     * @returns {Promise<Block.Publisher>}  Publisher object.
     */
    getPublisher(id: number): Promise<Block.Publisher> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.publisher, id);
    }

    /**
     * Get subscription object.
     *
     * @param {number} id                       Subscription id, last part of id -> X from '2.15.X'.
     * @returns {Promise<Block.Subscription>}   Subscription object.
     */
    getSubscription(id: number): Promise<Block.Subscription> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.subscription, id);
    }

    /**
     * Get seeding statistics object.
     *
     * @param {number} id                           Seeding statistics id, last part of id -> X from '2.16.X'.
     * @returns {Promise<Block.SeedingStatistics>}  SeedingStatistics object.
     */
    getSeedingStatistics(id: number): Promise<Block.SeedingStatistics> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.seeding_statistics, id);
    }

    /**
     * Get transaction detail object.
     *
     * @param {number} id                           Transaction detail id, last part of id -> X from '2.17.X'.
     * @returns {Promise<Block.TransactionDetail>}  TransactionDetail object.
     */
    getTransactionDetail(id: number): Promise<Block.TransactionDetail> {
        return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.transaction_detail, id);
    }

    /**
     * Get block object.
     *
     * @param {number} id                   Block number.
     * @returns {Promise<Block.Block>}      Block object.
     */
    getBlock(id: number): Promise<Block.Block> {
        const operation = new DatabaseOperations.GetBlock(id);
        return this.dbApi.execute(operation);
    }

    /**
     * Get blocks objects.
     *
     * @param {number} id                       Blocks start number to start list from.
     * @param {number} count                    Number of block to be listed in result.
     * @returns {Promise<Array<Block.Block>>}   List of Block objects.
     */
    getBlocks(id: number, count: number): Promise<Array<Block.Block>> {
        const promises = [];
        for (let i = 0; i < count; i++) {
            promises.push(this.getBlock(i));
        }
        return Promise.all(promises);
    }

    /**
     * Get number of accounts existing in DCore network.
     *
     * @returns {Promise<number>}   Number of accounts.
     */
    getAccountCount(): Promise<number> {
        const operation = new DatabaseOperations.GetAccountCount();
        return this.dbApi.execute(operation);
    }

    /**
     * Get accounts objects.
     *
     * @param {number} ids                  Blocks start id, last part of id -> X from '1.2.X'.
     * @returns {Promise<Array<Account>>}   List of account objects.
     */
    getAccounts(...ids: number[]): Promise<Array<Account>> {
        const operation = new DatabaseOperations.GetAccounts(ids.map(id => `${Space.protocol_ids}.${Type.Protocol.account}.${id}`));
        return this.dbApi.execute(operation);
    }

    /**
     * Get transaction object.
     *
     * @param {number} blockNo                  Block number.
     * @param {number} txNum                    Transaction number.
     * @returns {Promise<Block.Transaction>}    Transaction object.
     */
    getTransaction(blockNo: number, txNum: number): Promise<Block.Transaction> {
        const operation = new DatabaseOperations.GetTransaction(blockNo, txNum);
        return this.dbApi.execute(operation);
    }

    /**
     * Get list of miners objects.
     * TODO: move to MiningModule
     *
     * @param {string} fromId               Miner id to start from, last part of id -> X from '1.4.X'. Default '0.0.0' -> List from start
     * @param {number} limit                Limit result list. Default 100(Max)
     * @returns {Promise<Array<Miner>>}
     */
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

    /**
     * Get miners objects.
     *
     * @param {number[]} ids                List of miner ids, last part of id -> X from '1.4.X'.
     * @returns {Promise<Array<Miner>>}     List of miner objects.
     */
    getMiners(ids: number[]): Promise<Array<Miner>> {
        const op = new DatabaseOperations.GetMiners(ids.map(el => `${Space.protocol_ids}.${Type.Protocol.miner}.${el}`));
        return new Promise<Array<Miner>>((resolve, reject) => {
            this.dbApi.execute(op)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    /**
     * Get miner object.
     *
     * @param {number} id                   Miner id, last part of id -> X from '2.8.X'.
     * @returns {Promise<Miner | null>}     Miner object
     */
    getMiner(id: number): Promise<Miner|null> {
        return new Promise<Miner>((resolve, reject) => {
            this.getMiners([id])
                .then(res => {
                    resolve(res.length > 0 ? res[0] : null);
                })
                .catch(err => reject(err));
        });
    }

    /**
     * Get number of miners on DCore network.
     *
     * @returns {Promise<number>}   Number of miners.
     */
    getMinerCount(): Promise<number> {
        return new Promise<number>((resolve, reject) => {
            const operation = new DatabaseOperations.GetMinerCount();
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    /**
     * Get head block time.
     *
     * @returns {Promise<string>}   Head block time.
     */
    getHeadBlockTime(): Promise<string> {
        return new Promise<any>((resolve, reject) => {
            this.getDynamicGlobalProperty()
                .then(res => resolve(res.time))
                .catch(err => reject(err));
        });
    }
}
