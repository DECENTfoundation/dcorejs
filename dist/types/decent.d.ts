import { Core } from './api/core';
export interface DecentConfig {
    decent_network_wspaths: string[];
    chain_id: string;
    ipfs_server: string;
    ipfs_port: number;
}
export declare class Decent {
    private static _instance;
    private _config;
    private _core;
    readonly core: Core;
    static instance(): Decent;
    private constructor();
    initialize(config: DecentConfig): void;
}
