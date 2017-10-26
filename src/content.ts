import { DatabaseApi, DatabaseOperation } from './api/database'

export class SearchParams {
  term = ''
  order = ''
  user = ''
  region_code = ''
  itemId = ''
  category: number
  count: number
}

export class ContentApi {
  private _dbApi: DatabaseApi

  constructor(dbApi: DatabaseApi) {
    this._dbApi = dbApi
  }

  public searchContent(
    dbApi: DatabaseApi,
    searchParams: SearchParams
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      let params: any[] = []
      params = Object.keys(
        searchParams
      ).reduce((previousValue, currentValue) => {
        previousValue.push(currentValue)
        return previousValue
      }, params)

      dbApi
        .execute(DatabaseOperation.search_content, params)
        .then((content: any) => {
          resolve(content)
        })
        .catch((err: any) => {
          reject(err)
        })
    })
  }
}
