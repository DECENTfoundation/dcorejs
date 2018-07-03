import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';
import {Seeder} from '../model/content';
import {DatabaseOperations} from '../api/model/database';
import {SeedingError} from '../model/seeding';

export class SeedingModule extends ApiModule {
    constructor(dbApi: DatabaseApi) {
        super({ dbApi });
    }

    public listSeedersByPrice(limit: number = 100): Promise<Seeder[]> {
        return new Promise<Seeder[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSeeders(limit);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(SeedingError.database_operation_failed, err)));
        });
    }

    public listSeedersByUpload(limit: number = 100): Promise<Seeder[]> {
        return new Promise<Seeder[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSeedersByUpload(limit);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(SeedingError.database_operation_failed, err)));
        });
    }

    public listSeedersByRegion(region: string): Promise<Seeder[]> {
        return new Promise<Seeder[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSeedersByRegion(region);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(SeedingError.database_operation_failed, err)));
        });
    }

    public listSeedersByRating(limit: number = 100): Promise<Seeder[]> {
        return new Promise<Seeder[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSeedersByRating(limit);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(SeedingError.database_operation_failed, err)));
        });
    }
}
