/**
 * @module Model/Explorer
 */
import {Authority, Options} from './account';
import {Asset as TransactionAsset} from './transaction';

import {Key} from './content';

export enum ErrorExplorer {
    get_object_error = 'get_object_error',
    wrong_id_error = 'wrong_id_error'
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

    export interface Miner {
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

    export interface MinerSchedule {
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
        custom, // 5
        proposal,
        operation_history,
        withdraw_permission,
        vesting_balance,
        OBJECT_TYPE_COUNT // 10
    }

    export enum Implementation {
        global_property,
        dynamic_global_property,
        reserved,
        asset_dynamic_data_type,
        account_balance,
        account_statistics, // 5
        transaction,
        block_summary,
        account_transaction_history,
        chain_property,
        miner_schedule, // 10
        budget_record,
        buying,
        content,
        publisher,
        subscription, // 15
        seeding_statistics,
        transaction_detail,
        messaging
    }
}

export interface Miner {
    id: string;
    miner_account: string;
    last_aslot: number;
    signing_key: string;
    vote_id: string;
    total_votes: number;
    url: string;
    total_missed: number;
    last_confirmed_block_num: number;
}
