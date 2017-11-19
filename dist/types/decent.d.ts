import { Core } from './core';
export declare class DecentError {
    static app_not_initialized: string;
    static app_missing_config: string;
}
export interface DecentConfig {
    decent_network_wspaths: string[];
    chain_id: string;
}
export declare class Decent {
    private static _core;
    static readonly core: Core | null;
    static initialize(config: DecentConfig): void;
    private constructor();
}
