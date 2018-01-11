import {DatabaseApi, DatabaseOperations} from './api/database';

export class ErrorExplorer {
    static get_object_error = 'get_object_error';
}

export enum Space {
    relative_protocol_ids = 0,
    protocol_ids = 1,
    implementation_ids = 2
}

export namespace Type {
    export enum Protocol {
        null,
        base,
        account,
        asset,
        miner,
        custom,
        proposal,
        operation_history,
        withdraw_permission,
        vesting_balance,
        OBJECT_TYPE_COUNT
    }

    export enum Implementation {
        global_property,
        dynamic_global_property,
        reserved,
        asset_dynamic_data_type,
        account_balance,
        account_statistics,
        transaction,
        block_summary,
        account_transaction_history,
        chain_property,
        miner_schedule,
        budget_record,
        buying,
        content,
        publisher,
        subscription,
        seeding_statistics,
        transaction_detail,
        messaging
    }
}

export class ExplorerModule {
    private _database: DatabaseApi;

    constructor(databaseApi: DatabaseApi) {
        this._database = databaseApi;
    }

    private async getObject<T>(space: Space, type: Type.Implementation | Type.Protocol, id: number): Promise<T | null> {
        const operation = new DatabaseOperations.GetObjects([`${space}.${type}.${id}`]);
        try {
            const objects: Array<any> = await this._database.execute(operation);
            if (objects.length > 0) {
                return objects[0];
            } else {
                return null;
            }
        } catch (err) {
            return null;
        }
    }

    getAccount(id: number): Promise<any> {
        return this.getObject<any>(Space.protocol_ids, Type.Protocol.account, id);
    }

    getAsset(id: number): Promise<any> {
        return this.getObject(Space.protocol_ids, Type.Protocol.asset, id);
    }

    getWitness(id: number): Promise<any> {
        return this.getObject(Space.protocol_ids, Type.Protocol.miner, id);
    }

    getOperationHistory(id: number): Promise<any> {
        return this.getObject(Space.protocol_ids, Type.Protocol.operation_history, id);
    }

    getVestingBalance(id: number): Promise<any> {
        return this.getObject(Space.protocol_ids, Type.Protocol.vesting_balance, id);
    }

    // Implementation Space

    getGlobalProperty(): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.global_property, 0);
    }

    getDynamicGlobalProperty(): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.dynamic_global_property, 0);
    }

    getAssetDynamicDataType(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.asset_dynamic_data_type, id);
    }

    getAccountBalance(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.account_balance, id);
    }

    getAccountStatistics(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.account_statistics, id);
    }

    getBlockSummary(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.block_summary, id);
    }

    getAccountTransactionHistory(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.account_transaction_history, id);
    }

    getChainProperty(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.chain_property, id);
    }

    getWitnessSchedule(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.miner_schedule, id);
    }

    getBudgetRecord(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.budget_record, id);
    }

    getBuying(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.buying, id);
    }

    getContent(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.content, id);
    }

    getPublisher(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.publisher, id);
    }

    // getRating(id: number): Promise<any> {
    //     return this.getObject(Space.implementation_ids, Type.Implementation.rating, id);
    // }

    getSubscription(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.subscription, id);
    }

    getSeedingStatistics(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.seeding_statistics, id);
    }

    getTransactionDetail(id: number): Promise<any> {
        return this.getObject(Space.implementation_ids, Type.Implementation.transaction_detail, id);
    }
}
