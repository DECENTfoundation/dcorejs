export class ConnectionStatus {
  static open = 'open';
}

export class DatabaseError {
  static chain_connection_failed = 'chain_connection_failed';
  static chain_connecting = 'chain_connecting';
  static database_execution_failed = 'database_execution_failed';
}

export class DatabaseOperation {
  static searchContent = 'search_content';
  static getAccountByName = 'get_account_by_name';
  static getAccounts = 'get_accounts';
  static searchAccountHistory = 'search_account_history';
  static getAccountBalances = 'get_account_balances';
  static generateContentKeys = 'generate_content_keys';
  static restoreEncryptionKey = 'restore_encryption_key';
  static getBuyingObjectsByConsumer = 'get_buying_objects_by_consumer';
  static listPublishers = 'list_seeders_by_price';
}

export interface DatabaseConfig {
  decent_network_wspaths: string[];
}

export class Database {
  protected _api: any;
}

export class DatabaseApi extends Database {
  private _config: DatabaseConfig;
  protected _api: any;
  private _connectionStatus: string;
  private _apiConnector: Promise<any>;

  public static create(
    config: DatabaseConfig,
    api: any,
    chainStore: any
  ): DatabaseApi {
    return new DatabaseApi(config, api, chainStore);
  }

  private dbApi(): any {
    return this._api.instance().db_api();
  }

  constructor(config: DatabaseConfig, api: any, chainStore: any) {
    super();
    this._config = config;
    this._api = api;
  }

  public initApi(addresses: string[], forApi: any): Promise<any> {
    // TODO: when not connected yet, calls throws errors
    forApi.setRpcConnectionStatusCallback((status: any) => {
      this._connectionStatus = status;
    });
    this._apiConnector = new Promise((resolve, reject) => {
      this.connectDaemon(
        forApi,
        addresses,
        () => {
          resolve();
        },
        (error: string) => {
          reject(error);
        }
      );
    });
    return this._apiConnector;
  }

  private connectDaemon(
    toApi: any,
    addresses: string[],
    onSuccess: () => void,
    onError: (error: string) => void,
    addressIndex: number = 0
  ): Promise<any> | boolean {
    if (addresses.length <= addressIndex) {
      onError(DatabaseError.chain_connection_failed);
      return false;
    }
    const address = addresses[addressIndex];

    return toApi
      .instance(address, true)
      .init_promise.then(() => {
        onSuccess();
      })
      .catch((reason: any) => {
        this.connectDaemon(
          toApi,
          addresses,
          onSuccess,
          onError,
          addressIndex + 1
        );
      });
  }

  public execute(
    operation: DatabaseOperation,
    parameters: any[]
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      this._apiConnector.then(() => {
        this.dbApi()
          .exec(operation, parameters)
          .then((content: any) => resolve(content))
          .catch((err: any) => {
            // TODO: handle errors to DBApi errors
            reject(DatabaseError.database_execution_failed);
          });
      });
    });
  }
}
