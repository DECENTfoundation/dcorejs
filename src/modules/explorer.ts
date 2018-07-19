/**
 * @module ExplorerModule
 */
import {DatabaseApi} from '../api/database';
import {Account} from '../model/account';
import {DatabaseOperations} from '../api/model/database';
import {Block, Miner, Space, Type, ErrorExplorer} from '../model/explorer';
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

    private hasIdCorrectFormat(id: string, first: number, second: number): boolean {
        const parts = id.split('.').map(Number);
        return (parts.length === 3 && parts[0] === first && parts[1] === second);
    }

    private getLastPartOfId(id: string): number {
        return Number(id.split('.')[2]);
    }

    /**
     * Get account object.
     *
     * @param {string} id           Account id in format '1.2.X'.
     * @returns {Promise<Account>}  Account object.
     */
    getAccount(id: string): Promise<Account> {
        if (this.hasIdCorrectFormat(id, Space.protocol_ids, Type.Protocol.account)) {
            return this.getDatabaseObject<any>(Space.protocol_ids, Type.Protocol.account, this.getLastPartOfId(id));
        }
        return new Promise<Account>((resolve, reject) => {
            reject(this.handleError(
                ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.protocol_ids}.${Type.Protocol.account}.X`
            ));
        });
    }

    /**
     * Get asset object.
     *
     * @param {number} id               Asset id in format '1.3.X'.
     * @returns {Promise<Block.Asset>}  Asset object.
     */
    getAsset(id: string): Promise<Block.Asset> {
        if (this.hasIdCorrectFormat(id, Space.protocol_ids, Type.Protocol.asset)) {
            return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.asset, this.getLastPartOfId(id));
        }
        return new Promise<Block.Asset>((resolve, reject) => {
            reject(this.handleError(
                ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.protocol_ids}.${Type.Protocol.asset}.X`
            ));
        });
    }

    /**
     * Get miner object.
     *
     * @param {number} id               Miner id in format '1.4.X'.
     * @returns {Promise<Block.Miner>}  Miner object.
     */
    getWitness(id: string): Promise<Block.Miner> {
        if (this.hasIdCorrectFormat(id, Space.protocol_ids, Type.Protocol.miner)) {
            return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.miner, this.getLastPartOfId(id));
        }
        return new Promise<Block.Miner>((resolve, reject) => {
            reject(this.handleError(
                ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.protocol_ids}.${Type.Protocol.miner}.X`
            ));
        });
    }

    /**
     * Get list of history objects.
     * @param {number} id                       History id in format '1.7.X'.
     * @returns {Promise<Block.Transaction>}
     */
    getOperationHistory(id: string): Promise<Block.Transaction> {
        if (this.hasIdCorrectFormat(id, Space.protocol_ids, Type.Protocol.operation_history)) {
            return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.operation_history, this.getLastPartOfId(id));
        }
        return new Promise<Block.Transaction>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.protocol_ids}.${Type.Protocol.operation_history}.X`));
        });
    }

    /**
     * Get vesting balance object.
     *
     * @param {number} id                       Vesting balance id in format '1.9.X'.
     * @returns {Promise<Block.VestingBalance>}
     */
    getVestingBalance(id: string): Promise<Block.VestingBalance> {
        if (this.hasIdCorrectFormat(id, Space.protocol_ids, Type.Protocol.vesting_balance)) {
            return this.getDatabaseObject(Space.protocol_ids, Type.Protocol.vesting_balance, this.getLastPartOfId(id));
        }
        return new Promise<Block.VestingBalance>((resolve, reject) => {
            reject(this.handleError(
                ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.protocol_ids}.${Type.Protocol.vesting_balance}.X`
            ));
        });
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
     * @param {number} id                               Asset balance id in format '2.3.X'.
     * @returns {Promise<Block.AssetDynamicProperty>}   AssetDynamicProperty object.
     */
    getAssetDynamicDataType(id: string): Promise<Block.AssetDynamicProperty> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.asset_dynamic_data_type)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.asset_dynamic_data_type, this.getLastPartOfId(id));
        }
        return new Promise<Block.AssetDynamicProperty>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.asset_dynamic_data_type}.X`));
        });
    }

    /**
     * Get account balance object.
     *
     * @param {number} id                           Account balance id in format '2.4.X'.
     * @returns {Promise<Block.AccountBalance>}     AccountBalance object.
     */
    getAccountBalance(id: string): Promise<Block.AccountBalance> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.account_balance)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.account_balance, this.getLastPartOfId(id));
        }
        return new Promise<Block.AccountBalance>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.account_balance}.X`));
        });
    }

    /**
     * Get account statistics object.
     *
     * @param {number} id                           Account statistics id in format '2.5.X'.
     * @returns {Promise<Block.AccountStatistics>}  AccountStatistics object.
     */
    getAccountStatistics(id: string): Promise<Block.AccountStatistics> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.account_statistics)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.account_statistics, this.getLastPartOfId(id));
        }
        return new Promise<Block.AccountStatistics>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.account_statistics}.X`));
        });
    }

    /**
     * Get block summary object.
     *
     * @param {number} id                       Block summary id in format '2.7.X'.
     * @returns {Promise<Block.BlockSummary>}
     */
    getBlockSummary(id: string): Promise<Block.BlockSummary> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.block_summary)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.block_summary, this.getLastPartOfId(id));
        }
        return new Promise<Block.BlockSummary>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.block_summary}.X`));
        });
    }

    /**
     * Get list of account's transaction history objects.
     *
     * @param {number} id                                   Account transaction history id in format '2.8.X'.
     * @returns {Promise<Block.AccountTransactionHistory>}  List of account transaction history objects.
     */
    getAccountTransactionHistory(id: string): Promise<Block.AccountTransactionHistory> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.account_transaction_history)) {
            return this.getDatabaseObject(Space.implementation_ids,
                Type.Implementation.account_transaction_history,
                this.getLastPartOfId(id));
        }
        return new Promise<Block.AccountTransactionHistory>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.account_transaction_history}.X`));
        });
    }

    /**
     * Get chain property.
     *
     * @param {number} id                       Chain property id in format '2.9.X'.
     * @returns {Promise<Block.ChainProperty>}  ChainProperty object.
     */
    getChainProperty(id: string): Promise<Block.ChainProperty> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.chain_property)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.chain_property, this.getLastPartOfId(id));
        }
        return new Promise<Block.ChainProperty>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.chain_property}.X`));
        });
    }

    /**
     * Get miner's schedule object.
     *
     * @param {number} id                       Miner schedule id in format '2.10.X'.
     * @returns {Promise<Block.MinerSchedule>}  Miner schedule object.
     */
    getMinerSchedule(id: string): Promise<Block.MinerSchedule> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.miner_schedule)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.miner_schedule, this.getLastPartOfId(id));
        }
        return new Promise<Block.MinerSchedule>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.miner_schedule}.X`));
        });
    }

    /**
     * Get budget record object
     *
     * @param {number} id                       Budget record id in format '2.11.X'.
     * @returns {Promise<Block.BudgetReport>}   Budget record object.
     */
    getBudgetRecord(id: string): Promise<Block.BudgetReport> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.budget_record)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.budget_record, this.getLastPartOfId(id));
        }
        return new Promise<Block.BudgetReport>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.budget_record}.X`));
        });
    }

    /**
     * Get buying object.
     *
     * @param {number} id                   Buying object id in format '2.12.X'.
     * @returns {Promise<Block.Buying>}     Buying object.
     */
    getBuying(id: string): Promise<Block.Buying> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.buying)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.buying, this.getLastPartOfId(id));
        }
        return new Promise<Block.Buying>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.buying}.X`));
        });
    }

    /**
     * Get content object.
     *
     * @param {number} id                   Content object id in format '2.13.X'.
     * @returns {Promise<Block.Content>}    Content object.
     */
    getContent(id: string): Promise<Block.Content> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.content)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.content, this.getLastPartOfId(id));
        }
        return new Promise<Block.Content>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.content}.X`));
        });
    }

    /**
     * Get publisher object.
     *
     * @param {number} id                   Publisher object id in format '2.14.X'.
     * @returns {Promise<Block.Publisher>}  Publisher object.
     */
    getPublisher(id: string): Promise<Block.Publisher> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.publisher)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.publisher, this.getLastPartOfId(id));
        }
        return new Promise<Block.Publisher>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.publisher}.X`));
        });
    }

    /**
     * Get subscription object.
     *
     * @param {number} id                       Subscription object id in format '2.15.X'.
     * @returns {Promise<Block.Subscription>}   Subscription object.
     */
    getSubscription(id: string): Promise<Block.Subscription> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.subscription)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.subscription, this.getLastPartOfId(id));
        }
        return new Promise<Block.Subscription>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.subscription}.X`));
        });
    }

    /**
     * Get seeding statistics object.
     *
     * @param {number} id                           Seeding statistics object id in format '2.16.X'.
     * @returns {Promise<Block.SeedingStatistics>}  SeedingStatistics object.
     */
    getSeedingStatistics(id: string): Promise<Block.SeedingStatistics> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.seeding_statistics)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.seeding_statistics, this.getLastPartOfId(id));
        }
        return new Promise<Block.SeedingStatistics>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.seeding_statistics}.X`));
        });
    }

    /**
     * Get transaction detail object.
     *
     * @param {number} id                           Transaction detail object id in format '2.17.X'.
     * @returns {Promise<Block.TransactionDetail>}  TransactionDetail object.
     */
    getTransactionDetail(id: string): Promise<Block.TransactionDetail> {
        if (this.hasIdCorrectFormat(id, Space.implementation_ids, Type.Implementation.transaction_detail)) {
            return this.getDatabaseObject(Space.implementation_ids, Type.Implementation.transaction_detail, this.getLastPartOfId(id));
        }
        return new Promise<Block.TransactionDetail>((resolve, reject) => {
            reject(this.handleError(ErrorExplorer.wrong_id_error,
                `Wrong id! Id should be in format: ${Space.implementation_ids}.${Type.Implementation.transaction_detail}.X`));
        });
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
     * @param {number} ids                  Account ids in format '1.2.X'.
     * @returns {Promise<Array<Account>>}   List of account objects.
     */
    getAccounts(ids: string[]): Promise<Array<Account>> {
        const operation = new DatabaseOperations.GetAccounts(ids);
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
     *
     * @deprecated This method will be removed in next release
     * @param {string} fromId               Miner id to start from. Default '0.0.0' -> List from start
     * @param {number} limit                Limit result list. Default 100(Max)
     * @returns {Promise<Array<Miner>>}
     */
    listMiners(fromId: string = '0.0.0', limit: number = 100): Promise<Array<Miner>> {
        return new Promise((resolve, reject) => {
            const operation = new DatabaseOperations.LookupMiners(fromId, limit);
            this.dbApi.execute(operation)
                .then((res: [string, string][]) => {
                    const ids = res.map(el => el[1]);
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
     * @param {number[]} ids                List of miner ids in format '1.4.X'.
     * @returns {Promise<Array<Miner>>}     List of miner objects.
     */
    getMiners(ids: string[]): Promise<Array<Miner>> {
        const op = new DatabaseOperations.GetMiners(ids);
        return new Promise<Array<Miner>>((resolve, reject) => {
            this.dbApi.execute(op)
                .then(res => resolve(res))
                .catch(err => reject(err));
        });
    }

    /**
     * Get miner object.
     *
     * @param {number} id                   Miner id in format '2.8.X'.
     * @returns {Promise<Miner | null>}     Miner object
     */
    getMiner(id: string): Promise<Miner|null> {
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
