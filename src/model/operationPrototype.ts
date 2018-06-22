
export class TransferPrototype {
    static getPrototype(): object {
        return {
            from: '1.2.0',
            to: '1.2.0',
            price: {
                amount: 10,
                asset_id: '1.3.0',
            },
            memo: {
                from: '',
                to: '',
                nonce: 0,
                message: []
            }
        };
    }
}

export class ContentCancelPrototype {
    static getPrototype(): object {
        return {
            author: '1.2.0',
            URI: '',
        };
    }
}

export class BuyContentPrototype {
    static getPrototype(): object {
        return {
            URI: '',
            consumer: '',
            price: {
                amount: 0,
                asset_id: '1.3.0',
            },
            region_code_from: 0,
            pubKey: {
                s: '',
            },
        };
    }
}

export class SubmitContentPrototype {
    static getPrototype(): object {
        return {
            size: 1024,
            author: '1.2.0',
            co_authors: ['1.2.0', '1.2.1'],
            URI: '',
            quorum: 0,
            price: {
                region: 0,
                price: {
                    amount: 10,
                    asset_id: '1.3.0'
                }
            },
            hash: '',
            seeders: ['1.2.0', '1.2.3'],
            key_parts: [
                {C1: {s: ''}, D1: {s: ''}},
            ],
            expiration: '2018-07-04T16:00:00',
            publishing_fee: {
                amount: 0,
                asset_id: '1.3.0',
            },
            synopsis: ''
        };
    }
}

export class UpdateAccountPrototype {
    static getPrototype(): object {
        return {
            account: '1.2.0',
            owner: {
                weight_threshold: 0,
                account_auths: [],
                key_auths: [['', 0], ['', 1]],
            },
            active: {
                weight_threshold: 0,
                account_auths: [],
                key_auths: [['', 0], ['', 1]],
            },
            new_options: {
                memo_key: '',
                voting_account: '',
                num_miner: 0,
                votes: ['', ''],
                extensions: [],
                allow_subscription: true,
                price_per_subscribe: {
                    amount: 10,
                    asset_id: '1.3.0',
                },
                subscription_period: 0,
            },
            extensions: [],
        };
    }
}

export class AssetCreatePrototype {
    static getPrototype(): object {
        return {
            issuer: '',
            symbol: '',
            precision: 0,
            description: '',
            options: {
                max_supply: 0,
                core_exchange_rate: {
                    base: {
                        amount: 10,
                        asset_id: '1.3.0',
                    },
                    quote: {
                        amount: 10,
                        asset_id: '1.3.0',
                    },
                },
                is_exchangeable: false,
                extensions: [],
            },
            is_exchangeable: false,
            extensions: [],
            monitored_asset_opts: {
                feeds: [],
                current_feed: {
                    core_exchange_rate: {
                        base: {
                            amount: 10,
                            asset_id: '1.3.0',
                        },
                        quote: {
                            amount: 10,
                            asset_id: '1.3.0',
                        },
                    },
                },
                current_feed_publication_time: '',
                feed_lifetime_sec: 0,
                minimum_feeds: 0,
            },
        };
    }
}

export class IssueAssetPrototype {
    static getPrototype(): object {
        return {
            issuer: '',
            asset_to_issue: {
                amount: 10,
                asset_id: '1.3.0',
            },
            issue_to_account: '',
            memo: {
                from: '',
                to: '',
                nonce: 0,
                message: []
            },
            extensions: {}
        };
    }
}

export class UpdateUserIssuedAssetPrototype {
    static getPrototype(): object {
        return {
            issuer: '',
            asset_to_update: '',
            new_description: '',
            max_supply: 0,
            core_exchange_rate: {
                base: {
                    amount: 10,
                    asset_id: '1.3.0',
                },
                quote: {
                    amount: 10,
                    asset_id: '1.3.0',
                },
            },
            is_exchangeable: true,
            new_issuer: '',
            extensions: {},
        };
    }
}

export class AssetFundPoolsPrototype {
    static getPrototype(): object {
        return {
            from_account: '',
            uia_asset: {
                amount: 0,
                asset_id: '1.3.0',
            },
            dct_asset: {
                amount: 0,
                asset_id: '1.3.0',
            }
        };
    }
}

export class AssetReservePrototype {
    static getPrototype(): object {
        return {
            payer: '',
            amount_to_reserve: {
                amount: 0,
                asset_id: '1.3.0',
            },
            extensions: {}
        };
    }
}

export class AssetClaimFeesPrototype {
    static getPrototype(): object {
        return {
            issuer: '',
            uia_asset: {
                amount: 0,
                asset_id: '1.3.0',
            },
            dct_asset: {
                amount: 0,
                asset_id: '1.3.0',
            },
            extensions: {}
        };
    }
}

export class LeaveRatingAndCommentPrototype {
    static getPrototype(): object {
        return {
            URI: '',
            consumer: '',
            comment: '',
            rating: 0,
        };
    }
}

export class AssetPublishFeedPrototype {
    static getPrototype(): object {
        return {
            publisher: '',
            asset_id: '',
            feed: {
                core_exchange_rate: {
                    base: {
                        amount: 10,
                        asset_id: '1.3.0',
                    },
                    quote: {
                        amount: 10,
                        asset_id: '1.3.0',
                    },
                }
            },
            extensions: {}
        };
    }
}

export class MinerCreatePrototype {
    static getPrototype(): object {
        return {
            miner_account: '',
            url: '',
            block_signing_key: '',
        };
    }
}

export class MinerUpdatePrototype {
    static getPrototype(): object {
        return {
            miner: '',
            miner_account: '',
            new_url: '',
            new_signing_key: '',
        };
    }
}

export class MinerUpdateGlobalParametersPrototype {
    static getPrototype(): object {
        return {
            new_parameters: {
                current_fees: {
                    parameters: [[0, {}]],
                    scale: 0,
                },
                block_interval: 0,
                maintenance_interval: 0,
                maintenance_skip_slots: 0,
                miner_proposal_review_period: 0,
                maximum_transaction_size: 0,
                maximum_block_size: 0,
                maximum_time_until_expiration: 0,
                maximum_proposal_lifetime: 0,
                maximum_asset_feed_publishers: 0,
                maximum_miner_count: 0,
                maximum_authority_membership: 0,
                cashback_vesting_period_seconds: 0,
                cashback_vesting_threshold: 0,
                max_predicate_opcode: 0,
                max_authority_depth: 0,
                extensions: [],
            }
        };
    }
}

export class ProposalCreatePrototype {
    static getPrototype(): object {
        return {
            fee_paying_account: '',
            proposed_ops: [{}],
            expiration_time: '2018-07-04T16:00:00',
            review_period_seconds: 0,
            extensions: []
        };
    }
}

export class ProposalUpdatePrototype {
    static getPrototype(): object {
        return {
            fee_paying_account: '1.2.0',
            proposal: '1.6.0',
            active_approvals_to_add: ['', ''],
            active_approvals_to_remove: ['', ''],
            owner_approvals_to_add: ['', ''],
            owner_approvals_to_remove: ['', ''],
            key_approvals_to_add: ['', ''],
            key_approvals_to_remove: ['', ''],
            extensions: []
        };
    }
}

export class OperationWrapperPrototype {
    static getPrototype(): object {
        return {
            op: {},
        };
    }
}

export class CreateAccountPrototype {
    static getPrototype(): object {
        return {
            fee: {
                amount: 10,
                asset_id: '1.3.0'
            },
            name: '',
            owner: {
                weight_threshold: 0,
                account_auths: [],
                key_auths: [['', 0]],
            },
            active: {
                weight_threshold: 0,
                account_auths: [],
                key_auths: [['', 0]],
            },
            options: {
                memo_key: '',
                voting_account: '',
                num_miner: 0,
                votes: [],
                extensions: [],
                allow_subscription: true,
                price_per_subscribe: {
                    amount: 10,
                    asset_id: '1.3.0',
                },
                subscription_period: 0,
            },
            registrar: '',
            extensions: [],
        };
    }
}

export class VestingBalanceWithdrawPrototype {
    static getPrototype(): object {
        return {
            vesting_balance: '',
            owner: '',
            amount: {
                amount: 10,
                asset_id: '1.3.0',
            }
        };
    }
}
