import {Observable} from 'rxjs/Observable';
const concat = require('concat-stream');
const through = require('through2');

const IPFS = require('ipfs-api');

export interface IpfsConfig {
    ipfs_server: string
    ipfs_port: number
}

export class IpfsConnectionProtocol {
    static https = 'https';
}

export class IpfsMessage {
    type: string;
    payload: any;
}

export class IpfsProgressMessage extends IpfsMessage {
    private _type = 'progress_update';
    private _payload: number;

    get type(): string {
        return this._type;
    }

    get payload(): number {
        return this._payload;
    }

    cosnstructor(progress: number) {
        this._payload = progress;
    }
}

export class IpfsApi {
    private static fileSuffix = 'content.zip.aes';
    private _ipfsApi: any;
    private _config: IpfsConfig;

    constructor(config: IpfsConfig, protocol: string = IpfsConnectionProtocol.https) {
        this._config = config;
        this._ipfsApi = IPFS(this._config.ipfs_server, this._config.ipfs_port, {protocol: protocol});
    }

    addFile(fileHash: string, file: Buffer): Observable<any> {
        return new Observable(observable => {
            const fileInfo = {
                path: `${fileHash}/${IpfsApi.fileSuffix}`,
                content: file
            };
            this._ipfsApi.files.add(
                fileInfo,
                {
                    progress: (p: number) => {
                        console.log(p);
                    }
                },
                (err: any, res: any) => {
                    observable.next();
                    console.log(res);
                    console.log(err);
                }
            );
        });
    }

    getContent(hash: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._ipfsApi.object.get(
                hash,
                (err: any, res: any) => {
                    if (err || !res) {
                        reject(err);
                    }
                    const link = res.links.find((link: any) => link.name === IpfsApi.fileSuffix);
                    if (link.length === 0) {
                        reject('Err: content link not found');
                    }
                    this.getFile(link.multihash)
                        .then((files: any[]) => {
                            resolve(files[0]);
                        })
                        .catch(err => {
                            reject(err);
                        });
                });
        });
    }

    private getFile(hash: string): Promise<any> {
        return new Promise((resolve, reject) => {
            this._ipfsApi.files.get(
                hash,
                (err: any, res: any) => {
                    if (err) {
                        reject(err);
                    }
                    const files: any[] = [];
                    res.pipe(through.obj( (file: any, enc: any, next: any) => {
                        file.content.pipe(concat((content: any) => {
                            files.push({
                                path: file.path,
                                content: content
                            });
                            next();
                        }));
                    }, () => {
                        resolve(files);
                    }));
                });
        });
    }
}
