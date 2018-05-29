import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';

export class SubscriptionModule extends ApiModule {
    constructor(dbApi: DatabaseApi) {
        super(dbApi);
    }
}
