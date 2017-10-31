import { Core } from './api/core'

export interface DecentConfig {
  decent_network_wspaths: string[]
  chain_id: string
  ipfs_server: string
  ipfs_port: number
}

export class Decent {
  private static _instance: Decent
  private _config: DecentConfig
  private _core: Core

  get core(): Core {
    return this._core
  }

  public static instance(): Decent {
    return this._instance || (this._instance = new Decent())
  }

  private constructor() {}

  initialize(config: DecentConfig) {
    // TODO: check validity of config
    this._config = config
    this._core = Core.create({
      decent_network_wspaths: config.decent_network_wspaths,
      chain_id: config.chain_id
    })
  }
}
