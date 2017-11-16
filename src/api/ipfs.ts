// // const concat = require('concat-stream');
// import ConcatStream from 'concat-stream';
// const through = require('through2');
// const IPFS = require('ipfs-api');

// export class IpfsError {
//     static add_file_failed = 'add_file_failed';
//     static download_file_failed = 'download_file_failed';
//     static fetch_file_failed = 'fetch_file_failed';
// }

// export interface IpfsConfig {
//     ipfs_server: string
//     ipfs_port: number
// }

// export class IpfsConnectionProtocol {
//     static https = 'https';
// }

// export class IpfsMessage {
//     type: string;
//     payload: any;
// }

// export interface IpfsFile {
//     path: string
//     content: Buffer
// }

// export class IpfsProgressMessage extends IpfsMessage {
//     private _type = 'progress_update';
//     private _payload: number;

//     get type(): string {
//         return this._type;
//     }

//     get payload(): number {
//         return this._payload;
//     }

//     cosnstructor(progress: number) {
//         this._payload = progress;
//     }
// }

// export class IpfsApi {
//     private static fileSuffix = 'content.zip.aes';
//     private _ipfsApi: any;
//     private _config: IpfsConfig;

//     constructor(config: IpfsConfig, protocol: string = IpfsConnectionProtocol.https) {
//         this._config = config;
//         this._ipfsApi = IPFS(this._config.ipfs_server, this._config.ipfs_port, { protocol: protocol });
//     }

//     addFile(fileHash: string, file: Buffer): Promise<any> {
//         return new Promise((resolve, reject) => {
//             const fileInfo = {
//                 path: `${fileHash}/${IpfsApi.fileSuffix}`,
//                 content: file
//             };
//             this._ipfsApi.files.add(
//                 fileInfo,
//                 (err: any, res: any) => {
//                     if (err || !res) {
//                         reject(this.handleError(IpfsError.add_file_failed, err));
//                     }
//                     resolve();
//                 }
//             );
//         });
//     }

//     getContent(hash: string): Promise<any> {
//         return new Promise((resolve, reject) => {
//             this._ipfsApi.object.get(
//                 hash,
//                 (err: any, res: any) => {
//                     if (err || !res) {
//                         reject(this.handleError(IpfsError.download_file_failed, err));
//                     }
//                     const link = res.links.find((link: any) => link.name === IpfsApi.fileSuffix);
//                     if (link.length === 0) {
//                         reject('Err: content link not found');
//                     }
//                     this.getFile(link.multihash)
//                         .then((files: IpfsFile[]) => {
//                             resolve(files[0]);
//                         })
//                         .catch(err => {
//                             reject(err);
//                         });
//                 });
//         });
//     }

//     private getFile(hash: string): Promise<IpfsFile[]> {
//         return new Promise((resolve, reject) => {
//             this._ipfsApi.files.get(
//                 hash,
//                 (err: any, res: any) => {
//                     if (err) {
//                         reject(this.handleError(IpfsError.download_file_failed, err));
//                     }
//                     const files: IpfsFile[] = [];
//                     res.pipe(through.obj((file: any, enc: any, next: any) => {
//                         file.content.pipe(ConcatStream((content: any) => {
//                             console.log(content);
//                             files.push({
//                                 path: file.path,
//                                 content: content
//                             });
//                             next();
//                         }));
//                     }, () => {
//                         resolve(files);
//                     }));
//                 });
//         });
//     }

//     private handleError(name: string, details: any): Error {
//         const err = new Error(name);
//         err.stack = details;
//         return err;
//     }
// }
