import { AccountApi } from '../src/account';
import { DatabaseApiMock } from '../src/mocks/DatabaseApiMock';

let accountApi;
const accName = 'u6bbca9e1c60e1a132e3dc6fb2ba2ebe3';

function prepare() {
  accountApi = new AccountApi(new DatabaseApiMock(), null);
}

describe('AccountApi test', () => {
  beforeEach(() => prepare());

  it('should be AccountApi instance', () => {
    expect(accountApi).toBeInstanceOf(AccountApi);
  });

  it('should return account', () => {
    accountApi.getAccountByName(accName).then((acc: any) => {
      expect(acc).toBeDefined();
      expect(acc.name).toEqual(accName);
    });
  });
});
