import { Core } from './core';

export class DecentError {
    static app_not_initialized = 'app_not_initialized';
    static app_missing_config = 'app_missing_config';
}

export interface DecentConfig {
    decent_network_wspaths: string[]
    chain_id: string
    ipfs_server: string
    ipfs_port: number
}

export class Decent {
    // private static _config: DecentConfig;
    private static _core: Core;

    public static get core(): Core | null {
        if (!Decent._core) {
            throw new Error(DecentError.app_not_initialized);
        }
        return Decent._core;
    }



    public static initialize(config: DecentConfig): void {
        if (config.decent_network_wspaths[0] === '' || config.chain_id === '') {
            throw new Error(DecentError.app_missing_config);
        }
        // Decent._config = config;
        Decent._core = Core.create({
            decent_network_wspaths: config.decent_network_wspaths,
            chain_id: config.chain_id
        });
        // Decent._storage = new StorageApi({
        //     ipfs_server: config.ipfs_server,
        //     ipfs_port: config.ipfs_port
        // });
    }

    private constructor() {
    }
}
