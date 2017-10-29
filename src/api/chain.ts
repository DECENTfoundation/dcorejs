const { FetchChain, TransactionHelper } = require('decentjs-lib/lib')

export interface ChainMethod {
  name: string
  param: any
}

export class ChainMethods {
  static getAccount = 'getAccount'
  static getAsset = 'getAsset'

  private _commands: ChainMethod[] = []
  get commands(): ChainMethod[] {
    return this._commands
  }

  add(method: string, params: any) {
    this._commands.push({ name: method, param: params })
  }
}

export class ChainApi {
  public static initChain(chainId: string, chainConfig: any) {
    chainConfig.networks.decent = {
      chain_id: chainId
    }
  }

  /**
     * Fetches data from blockchain.
     *
     * @param {ChainOperation} operation
     * @return {Promise<any[]>}
     */
  public static fetch(operation: ChainMethods): Promise<any[]> {
    const commands = operation.commands.map(op => FetchChain(op.name, op.param))
    return Promise.all(commands)
  }

  /**
     * Generates random sequence of bytes
     */
  public static generateNonce(): string {
    return TransactionHelper.unique_nonce_uint64()
  }
}
