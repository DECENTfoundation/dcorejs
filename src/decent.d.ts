export declare interface DecentConfig {
    /**
     * Array of WebSocket addresses to Decent daemon
     * example: ['wss://test.decent.com:8090']
     */
    decent_network_wspaths: string[]
    /**
     * Decent network blockchain id
     */
    chain_id: string
    /**
     * IPFS node server address
     * example: 'ipfs.test.com'
     */
    ipfs_server: string
    /**
     * IPFS node server port
     */
    ipfs_port: number
}
