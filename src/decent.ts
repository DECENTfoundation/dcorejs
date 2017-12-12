import {setLibRef} from './helpers';
import {ContentApi} from './content';
import {ChainApi} from './api/chain';
import {DatabaseApi} from './api/database';
import {AccountApi} from './account';

let decentjslib: any = null;
let _content: ContentApi = null;
let _account: AccountApi = null;

export class DecentError {
    static app_not_initialized = 'app_not_initialized';
    static app_missing_config = 'app_missing_config';
}

export interface DecentConfig {
    decent_network_wspaths: string[]
    chain_id: string
}

export class Decent {
    // private static _config: DecentConfig;
    // private static _core: Core;
    private _contentApi: ContentApi;
    private _accountApi: AccountApi;

    public get contentApi(): ContentApi {
        return this._contentApi;
    }

    public get accountApi(): AccountApi {
        return this._accountApi;
    }

    public static initialize(config: DecentConfig,
                             api: any,
                             chainConfigApi: any,
                             chainStore: any): Decent {
        const decent = new Decent();
        Decent.setupChain(config.chain_id, chainConfigApi);
        const database = DatabaseApi.create(config, api);
        const apiConnectionPromise = database.initApi();

        const chain = new ChainApi(apiConnectionPromise, chainStore);
        decent._contentApi = new ContentApi(database, chain);
        decent._accountApi = new AccountApi(database, chain);
        return decent;
    }

    private static setupChain(chainId: string, chainConfig: any) {
        ChainApi.setupChain(chainId, chainConfig);
    }

    public constructor() {
    }
}

export function initialize(config: DecentConfig, decentjs_lib: any): void {
    decentjslib = decentjs_lib;
    setLibRef(decentjslib);
    ChainApi.setupChain(config.chain_id, decentjslib.ChainConfig);
    const database = DatabaseApi.create(config, decentjslib.Apis);
    const apiConnectionPromise = database.initApi();

    const chain = new ChainApi(apiConnectionPromise, decentjslib.ChainStore);
    _content = new ContentApi(database, chain);
    _account = new AccountApi(database, chain);
}

export function content(): ContentApi {
    return _content;
}

export function account(): AccountApi {
    return _account;
}
