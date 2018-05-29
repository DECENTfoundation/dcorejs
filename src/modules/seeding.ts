import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';

export class SeedingModule extends ApiModule {
    constructor(dbApi: DatabaseApi) {
        super(dbApi);
    }
}
