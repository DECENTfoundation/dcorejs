import {DatabaseApi, DatabaseOperations} from './api/database';
import {Account, Authority, Options} from './account';
import {Asset as TransactionAsset} from './transaction';
import {Key} from './content';

export class ErrorExplorer {
    static get_object_error = 'get_object_error';
}

export namespace Block {
    export interface Asset {
        id: string;
        symbol: string;
        precision: number;
        issuer: string;
        description: string;
        monitored_asset_opts: MonitoredOptions;
        options: AssetOptions;
        dynamic_asset_data_id: string
    }

    export interface MonitoredOptions {
        feeds: Array<any>;
        current_feed: object;
        current_feed_publication_time: string;
        feed_lifetime_sec: number;
        minimum_feeds: number
    }

    export interface AssetOptions {
        max_supply: Number;
        core_exchange_rate: AssetExchangeRate;
        is_exchangeable: Boolean;
        extensions: Array<any>;
    }

    export interface AssetExchangeRate {
        base: TransactionAsset;
        quote: TransactionAsset
    }

    export interface Witness {
        id: string;
        miner_account: string;
        last_aslot: number;
        signing_key: string;
        pay_vb: string;
        vote_id: string;
        total_votes: number;
        url: string;
        total_missed: number;
        last_confirmed_block_num: number;
    }

    export interface Transaction {
        id: string;
        op: [number, Operation];
        result: [number, string];
        block_num: number;
        trx_in_block: number;
        op_in_trx: number;
        virtual_op: number
    }

    export interface Operation {
        fee: TransactionAsset;
        registrar: string;
        name: string;
        owner: Authority;
        active: Authority;
        options: Options;
        extensions: object
    }

    export interface VestingBalance {
        id: string;
        owner: string;
        balance: {
            amount: string;
            asset_id: string
        };
        policy: [number, VestingPolicy];
    }

    export interface VestingPolicy {
        vesting_seconds: number;
        start_claim: string;
        coin_seconds_earned: string;
        coin_seconds_earned_last_update: string;
    }

    export interface GlobalProperty {
        id: string;
        parameters: {
            current_fees: {
                parameters: Array<[number, object]>;
                scale: number;
            };
            block_interval: number;
            maintenance_interval: number;
            maintenance_skip_slots: number;
            miner_proposal_review_period: number;
            maximum_transaction_size: number;
            maximum_block_size: number;
            maximum_time_until_expiration: number;
            maximum_proposal_lifetime: number;
            maximum_asset_feed_publishers: number;
            maximum_miner_count: number;
            maximum_authority_membership: number;
            cashback_vesting_period_seconds: number;
            cashback_vesting_threshold: number;
            max_predicate_opcode: number;
            max_authority_depth: number;
            extensions: Array<any>;
        };
        next_available_vote_id: number;
        active_miners: Array<string>;
    }

    export interface DynamicGlobalProperty {
        id: string;
        head_block_number: number;
        head_block_id: string;
        time: string;
        current_miner: string;
        next_maintenance_time: string;
        last_budget_time: string;
        unspent_fee_budget: number;
        mined_rewards: string;
        miner_budget_from_fees: number;
        miner_budget_from_rewards: string;
        accounts_registered_this_interval: number;
        recently_missed_count: number;
        current_aslot: number;
        recent_slots_filled: string;
        dynamic_flags: number;
        last_irreversible_block_num: number;
    }

    export interface AssetDynamicProperty {
        id: string;
        current_supply: string;
        asset_pool: number;
        core_pool: number;
    }

    export interface AccountBalance {
        id: string;
        owner: string;
        asset_type: string;
        balance: number;
    }

    export interface AccountStatistics {
        id: string;
        owner: string;
        most_recent_op: string;
        total_ops: number;
        total_core_in_orders: number;
        pending_fees: number;
        pending_vested_fees: number;
    }

    export interface BlockSummary {
        id: string;
        block_id: string;
    }

    export interface AccountTransactionHistory {
        id: string;
        account: string;
        operation_id: string;
        sequence: number;
        next: string;
    }

    export interface ChainProperty {
        id: string;
        chain_id: string;
        immutable_parameters: {
            min_miner_count: number;
            num_special_accounts: number;
            num_special_assets: number;
        };
    }

    export interface WitnessSchedule {
        id: string;
        current_shuffled_miners: Array<string>;
    }

    export interface BudgetReport {
        id: string;
        time: string;
        record: {
            time_since_last_budget: number,
            from_initial_reserve: string,
            from_accumulated_fees: number
            planned_for_mining: number
            generated_in_last_interval: number
            supply_delta: number
            _real_supply: {
                account_balances: string
                vesting_balances: number
                escrows: number
                pools: number
            },
            next_maintenance_time: string,
            block_interval: number
        };
    }

    export interface Buying {
        id: string;
        consumer: string;
        URI: string;
        synopsis: string;
        price: TransactionAsset;
        paid_price_before_exchange: TransactionAsset;
        paid_price_after_exchange: TransactionAsset;
        seeders_answered: Array<string>;
        size: number;
        rating: string;
        comment: string;
        expiration_time: string;
        pubKey: string;
        key_particles: Array<any>;
        expired: boolean;
        delivered: boolean;
        expiration_or_delivery_time: string;
        rated_or_commented: boolean;
        created: string;
        region_code_from: number;
    }

    export interface Content {
        id: string;
        author: string;
        co_authors: Array<string>;
        expiration: string;
        created: string;
        price: {
            map_price: Array<any>
        };
        size: number;
        synopsis: string;
        URI: string;
        quorum: number;
        key_parts: Array<any>;
        _hash: string;
        last_proof: string;
        is_blocked: boolean;
        AVG_rating: number;
        num_of_ratings: number;
        times_bought: number;
        publishing_fee_escrow: TransactionAsset;
        cd: {
            n: number;
            u_seed: string;
            pubKey: string;
        };
        seeder_price: Array<any>;
    }

    export interface Publisher {
        id: number;
        result: [
            {
                id: string;
                seeder: string;
                free_space: number;
                price: TransactionAsset;
                expiration: string;
                pubKey: Key;
                ipfs_ID: string;
                stats: string
                rating: number;
                region_code: string;
            }
            ];
    }

    export interface Rating {
        id: number
        result: [
            {
                id: string;
                from: string;
                to: string;
                expiration: string;
                automatic_renewal: boolean;
            }
            ];
    }

    export interface Subscription {
        id: string;
        seeder: string;
        total_upload: number;
        missed_delivered_keys: number
        total_delivered_keys: number;
        total_content_seeded: number;
        num_of_content_seeded: number;
        total_content_requested_to_seed: number;
        num_of_pors: number;
        uploaded_till_last_maint: number;
        avg_buying_ratio: number;
        seeding_rel_ratio: number;
        seeding_abs_ratio: number;
        missed_ratio: number;
    }

    export interface SeedingStatistics {
        id: string;
        m_from_account: string;
        m_to_account: string;
        m_operation_type: number;
        m_transaction_amount: TransactionAsset;
        m_transaction_fee: TransactionAsset;
        m_str_description: string;
        m_timestamp: string;
    }

    export interface TransactionDetail {
        id: string;
        created: string;
        sender: string;
        sender_pubkey: string;
        receivers_data: [
            {
                receiver: string;
                receiver_pubkey: string;
                nonce: string;
                data: string;
            }
            ];
        text: string;
    }

    export interface Block {
        height: number;
        previous: string;
        timestamp: string;
        miner: string;
        miner_signature: string;
        witness: string;
        transaction_merkle_root: string;
        extensions: string;
        transactions: Transaction[];
    }

    export interface Transaction {
        ref_block_num: number;
        ref_block_prefix: number;
        expiration: string;
        operations: [
            [
                number,
                {
                    fee: TransactionAsset,
                    seeder: string,
                    URI: string
                }
                ]
            ],
        extensions: any[];
        signatures: string[];
        operation_results: [[number, object]];
    }
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

    getAccount(id: number): Promise<Account> {
        return this.getObject<any>(Space.protocol_ids, Type.Protocol.account, id);
    }

    getAsset(id: number): Promise<Block.Asset> {
        return this.getObject(Space.protocol_ids, Type.Protocol.asset, id);
    }

    getWitness(id: number): Promise<Block.Witness> {
        return this.getObject(Space.protocol_ids, Type.Protocol.miner, id);
    }

    getOperationHistory(id: number): Promise<Block.Transaction> {
        return this.getObject(Space.protocol_ids, Type.Protocol.operation_history, id);
    }

    getVestingBalance(id: number): Promise<Block.VestingBalance> {
        return this.getObject(Space.protocol_ids, Type.Protocol.vesting_balance, id);
    }

    getGlobalProperty(): Promise<Block.GlobalProperty> {
        return this.getObject(Space.implementation_ids, Type.Implementation.global_property, 0);
    }

    getDynamicGlobalProperty(): Promise<Block.DynamicGlobalProperty> {
        return this.getObject(Space.implementation_ids, Type.Implementation.dynamic_global_property, 0);
    }

    getAssetDynamicDataType(id: number): Promise<Block.AssetDynamicProperty> {
        return this.getObject(Space.implementation_ids, Type.Implementation.asset_dynamic_data_type, id);
    }

    getAccountBalance(id: number): Promise<Block.AccountBalance> {
        return this.getObject(Space.implementation_ids, Type.Implementation.account_balance, id);
    }

    getAccountStatistics(id: number): Promise<Block.AccountStatistics> {
        return this.getObject(Space.implementation_ids, Type.Implementation.account_statistics, id);
    }

    getBlockSummary(id: number): Promise<Block.BlockSummary> {
        return this.getObject(Space.implementation_ids, Type.Implementation.block_summary, id);
    }

    getAccountTransactionHistory(id: number): Promise<Block.AccountTransactionHistory> {
        return this.getObject(Space.implementation_ids, Type.Implementation.account_transaction_history, id);
    }

    getChainProperty(id: number): Promise<Block.ChainProperty> {
        return this.getObject(Space.implementation_ids, Type.Implementation.chain_property, id);
    }

    getWitnessSchedule(id: number): Promise<Block.WitnessSchedule> {
        return this.getObject(Space.implementation_ids, Type.Implementation.miner_schedule, id);
    }

    getBudgetRecord(id: number): Promise<Block.BudgetReport> {
        return this.getObject(Space.implementation_ids, Type.Implementation.budget_record, id);
    }

    getBuying(id: number): Promise<Block.Buying> {
        return this.getObject(Space.implementation_ids, Type.Implementation.buying, id);
    }

    getContent(id: number): Promise<Block.Content> {
        return this.getObject(Space.implementation_ids, Type.Implementation.content, id);
    }

    getPublisher(id: number): Promise<Block.Publisher> {
        return this.getObject(Space.implementation_ids, Type.Implementation.publisher, id);
    }

    getSubscription(id: number): Promise<Block.Subscription> {
        return this.getObject(Space.implementation_ids, Type.Implementation.subscription, id);
    }

    getSeedingStatistics(id: number): Promise<Block.SeedingStatistics> {
        return this.getObject(Space.implementation_ids, Type.Implementation.seeding_statistics, id);
    }

    getTransactionDetail(id: number): Promise<Block.TransactionDetail> {
        return this.getObject(Space.implementation_ids, Type.Implementation.transaction_detail, id);
    }

    getBlock(id: number): Promise<Block.Block> {
        const operation = new DatabaseOperations.GetBlock(id);
        return this._database.execute(operation);
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
        return this._database.execute(operation);
    }

    getAccounts(...ids: string[]): Promise<Array<Account>> {
        const operation = new DatabaseOperations.GetAccounts(ids);
        return this._database.execute(operation);
    }

    getTransaction(blockNo: number, txNum: number): Promise<Block.Transaction> {
        const operation = new DatabaseOperations.GetTransaction(blockNo, txNum);
        return this._database.execute(operation);
    }
}
