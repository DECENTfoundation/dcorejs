export class ChainApi {
  static initChain(chainId: string, chainConfig: any) {
    chainConfig.networks.decent = {
      chain_id: chainId
    }
  }
}
