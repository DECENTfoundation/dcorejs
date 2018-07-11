import {ApiModule} from './ApiModule';
import {DatabaseApi} from '../api/database';
import {Seeder} from '../model/content';
import {DatabaseOperations} from '../api/model/database';
import {SeedingError} from '../model/seeding';

export class SeedingModule extends ApiModule {
    constructor(dbApi: DatabaseApi) {
        super({ dbApi });
    }

    /**
     * List active seeders, ordered by price per MB.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a0fb24b59633fe48d8d4ff0bec4412f7b
     *
     * @param {number} limit            Limit result size. Default 100(Max)
     * @returns {Promise<Seeder[]>}     List of Seeder objects.
     */
    public listSeedersByPrice(limit: number = 100): Promise<Seeder[]> {
        return new Promise<Seeder[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSeeders(limit);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(SeedingError.database_operation_failed, err)));
        });
    }

    /**
     * List active seeders, ordered by amount of data uploaded to buyers.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a9d0dd50b30bc28256d0df7538050e982
     *
     * @param {number} limit            Limit result size. Default 100(Max)
     * @returns {Promise<Seeder[]>}     List of Seeder objects.
     */
    public listSeedersByUpload(limit: number = 100): Promise<Seeder[]> {
        return new Promise<Seeder[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSeedersByUpload(limit);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(SeedingError.database_operation_failed, err)));
        });
    }

    /**
     * List active seeders, ordered by region code.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#a69c457b76e2cee7fd12d2ca9dcd2eeec
     *
     * @param {number} limit            Limit result size. Default 100(Max)
     * @returns {Promise<Seeder[]>}     List of Seeder objects.
     */
    public listSeedersByRegion(region: string): Promise<Seeder[]> {
        return new Promise<Seeder[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSeedersByRegion(region);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(SeedingError.database_operation_failed, err)));
        });
    }

    /**
     * List active seeders, ordered by rating.
     * https://docs.decent.ch/developer/classgraphene_1_1app_1_1database__api__impl.html#ad3d507bb48ec37b4cf1ebd75f4a8531a
     *
     * @param {number} limit            Limit result size. Default 100(Max)
     * @returns {Promise<Seeder[]>}     List of Seeder objects.
     */
    public listSeedersByRating(limit: number = 100): Promise<Seeder[]> {
        return new Promise<Seeder[]>((resolve, reject) => {
            const operation = new DatabaseOperations.ListSeedersByRating(limit);
            this.dbApi.execute(operation)
                .then(res => resolve(res))
                .catch(err => reject(this.handleError(SeedingError.database_operation_failed, err)));
        });
    }
}
