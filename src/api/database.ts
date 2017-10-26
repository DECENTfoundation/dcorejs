export class Error {
  static chain_connection_failed = 'chain_connection_failed'
}

export class DatabaseOperation {
  static search_content = 'search_content'
}

export interface DatabaseConfig {
  decent_network_wspaths: string[]
}

export class DatabaseApi {
  private _config: DatabaseConfig
  private _api: any

  public static create(config: DatabaseConfig, api: any): DatabaseApi {
    return new DatabaseApi(config, api)
  }

  private initApi(addresses: string[], forApi: any): Promise<any> {
    return new Promise((resolve, reject) => {
      this.connectDaemon(
        forApi,
        addresses,
        () => {
          resolve()
        },
        (error: string) => {
          reject(error)
        }
      )
    })
  }

  private connectDaemon(
    toApi: any,
    addresses: string[],
    onSuccess: () => void,
    onError: (error: string) => void,
    addressIndex: number = 0
  ) {
    if (addresses.length <= addressIndex) {
      onError(Error.chain_connection_failed)
      return
    }
    const address = addresses[addressIndex]

    toApi
      .instance(address, true)
      .init_promise.then(() => {
        onSuccess()
      })
      .catch((reason: any) => {
        console.log(``)
        this.connectDaemon(
          toApi,
          addresses,
          onSuccess,
          onError,
          addressIndex + 1
        )
      })
  }

  private constructor(config: DatabaseConfig, api: any) {
    this._config = config
    this._api = api
    this.initApi(this._config.decent_network_wspaths, this._api)
  }

  private dbApi(): any {
    return this._api.db_api()
  }

  public execute(command: DatabaseOperation, parameters: any[]): Promise<any> {
    return new Promise((resolve, reject) => {
      this.dbApi()
        .exec(command, parameters)
        .then((content: any) => resolve(content))
        .catch((err: any) => {
          // TODO: handle errors to DBApi errors
          reject(err)
        })
    })
  }
}
