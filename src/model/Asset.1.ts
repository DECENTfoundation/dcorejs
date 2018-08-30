import { Utils } from '../utils';
import { ChainApi } from '../api/chain';
import { AssetObject } from './asset';
export class Asset {
    amount: number;
    asset_id: string;
    public static createDCTAsset(amount: number): Asset {
        return {
            amount: amount * ChainApi.DCTPower,
            asset_id: ChainApi.asset_id
        };
    }
    public static create(amount: number, assetObject: AssetObject): Asset {
        return new Asset(Utils.formatAmountToAsset(amount, assetObject), assetObject.id);
    }
    constructor(amount: number, assetId: string) {
        this.asset_id = assetId;
        this.amount = amount;
    }
}
