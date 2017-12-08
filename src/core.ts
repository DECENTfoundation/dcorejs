import { ContentApi } from './content';
import { DatabaseApi } from './api/database';
import { ChainApi } from './api/chain';
import { AccountApi } from './account';


export interface CoreConfig {
    decent_network_wspaths: string[];
    chain_id: string;
}

export class Core {
    private _content: ContentApi;
    private _account: AccountApi;
    private _database: DatabaseApi;
    private _chain: ChainApi;

    get content(): ContentApi {
        return this._content;
    }

    get account(): AccountApi {
        return this._account;
    }

    public static create(config: CoreConfig,
                         api: any,
                         chainConfigApi: any,
                         chainStore: any): Core {
        const core = new Core();
        core.setupChain(config.chain_id, chainConfigApi);
        core._database = DatabaseApi.create(config, api);
        const apiConnectionPromise = core._database.initApi();
        core._chain = new ChainApi(apiConnectionPromise, chainStore);
        core._content = new ContentApi(core._database, core._chain);
        core._account = new AccountApi(core._database, core._chain);
        return core;
    }

    private setupChain(chainId: string, chainConfig: any) {
        ChainApi.setupChain(chainId, chainConfig);
    }

    private constructor() {
    }
}
