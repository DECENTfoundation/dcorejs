// import { IpfsApi } from './api/ipfs';

// export interface StorageConfig {
//     ipfs_server: string;
//     ipfs_port: number;
// }

// export class StorageApi {
//     private _ipfsApi: IpfsApi;

//     constructor(storageConfig: StorageConfig) {
//         this._ipfsApi = new IpfsApi({
//             ipfs_server: storageConfig.ipfs_server,
//             ipfs_port: storageConfig.ipfs_port
//         });
//     }

//     /**
//      * Downloads file from IPFS.
//      *
//      * @param {string} fileHash     RIPEMD160 hash of encrypted file used to fetch file form IPFS
//      * @return {Promise<any>}
//      */
//     downloadFile(fileHash: string): Promise<any> {
//         return new Promise((resolve, reject) => {
//             this._ipfsApi.getContent(fileHash)
//                 .then((file: any) => {
//                     resolve(file);
//                 })
//                 .catch((err: any) => {
//                     reject(err);
//                 });
//         });
//     }
// }
