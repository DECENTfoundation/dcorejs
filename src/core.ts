import {ContentApi} from './content';
import {DatabaseApi} from './api/database';
import {ChainApi} from './api/chain';
import {AccountApi} from './account';

const {Apis, ChainConfig} = require('decentjs-lib/lib/ws/cjs');
const {ChainStore} = require('decentjs-lib/lib');

export interface CoreConfig {
    decent_network_wspaths: string[]
    chain_id: string
}

export class Core {
    private _content: ContentApi;
    private _user: AccountApi;
    private _config: CoreConfig;
    private _database: DatabaseApi;
    private _chain: ChainApi;

    get content(): ContentApi {
        return this._content;
    }

    get user(): AccountApi {
        return this._user;
    }

    public static create(config: CoreConfig,
                         api: any = Apis,
                         chainConfigApi: any = ChainConfig): Core {
        const core = new Core(config);
        core.setupChain(config.chain_id, chainConfigApi);
        core._database = DatabaseApi.create(config, api, ChainStore);
        const apiConnectionPromise = core._database.initApi(config.decent_network_wspaths, api);
        core._chain = new ChainApi(apiConnectionPromise);
        core._content = new ContentApi(core._database, core._chain);
        core._user = new AccountApi(core._database, core._chain);
        return core;
    }

    private setupChain(chainId: string, chainConfig: any) {
        ChainApi.setupChain(chainId, chainConfig);
    }

    private constructor(config: CoreConfig) {
        this._config = config;
    }
}
