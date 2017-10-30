import { ContentApi } from './content'
import { DatabaseApi } from './api/database'
import { ChainApi } from './api/chain'
import { AccountApi } from './account'

const { Apis, ChainConfig } = require('decentjs-lib/lib/ws/cjs')

export interface CoreConfig {
  decent_network_wspaths: string[]
  chain_id: string
}

export class Core {
  private _content: ContentApi
  private _user: AccountApi
  private _config: CoreConfig
  private _database: DatabaseApi

  get content(): ContentApi {
    return this._content
  }

  get user(): AccountApi {
    return this._user
  }

  public static create(
    config: CoreConfig,
    api: any = Apis,
    chainConfigApi: any = ChainConfig
  ): Core {
    const core = new Core(config)
    core.initChain(config.chain_id, chainConfigApi)
    core._database = DatabaseApi.create(config, api)
    core._content = new ContentApi(core._database)
    core._user = new AccountApi(core._database)
    return core
  }

  private initChain(chainId: string, chainConfig: any) {
    ChainApi.initChain(chainId, chainConfig)
  }

  private constructor(config: CoreConfig) {
    this._config = config
  }
}
