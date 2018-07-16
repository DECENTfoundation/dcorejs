# Quick look into DECENT

## The new way of publishing

 Our intention is to revolutionize digital distribution across the Internet.

 DCore Network is a content distribution platform that is decentralized,
 open-source and uses Blockchain technology. Blockchain technology guarantees
 trust and security by embedding encryption at the lowest level.
 Perhaps the greatest benefit of this implementation of blockchain technology
 is invariant storage for published content which can eliminate manipulation
 and influence by any sort of middleman (eg. publisher). In short content can
 now be created and delivered directly with any fees collected solely by
 the seller at the point of sale. In addition to the technological side,
 there are the economical and social protocols that will govern real-world
 interactions across the network. In order to make transactions viable and
 user friendly a crypto-token, the DCT, has been implemented. The encrypted
 DCT tokens help mitigate attacks, promote funding and ensure transaction
 validation. One last thing of note, unlike other content distribution platforms
 underdevelopment, there are virtually no limitations as to the type of media that
 can be published on Dcore Network. It could be songs, books, articles, videos,
 source code, or anything really and in almost any format.

# dcorejs

Javascript library for browser and node.js to work with Dcore blockchain network.
Supported browsers versions:
 - Chrome   - > 54
 - Firefox  - > 58
 - Safari   - > 11
 - Edge     - > 41

## Quick start

### Installation

 1. Install `Node.js >6` and `npm >3` globally 
 
 2. For Windows you need to install [node-gyp](https://github.com/nodejs/node-gyp) build tool.

 3. Change directory to project root dir

 4. Install `npm install dcorejs`
 
 ### Customization
 
 In case you want to customize library and generate documentation for code use command `npm run generate-docs`.
 Documentation will be generated in `./dist/docs` folder.

### Initialize library

## Server

```typescript
import * as dcorejs_lib from 'dcorejs-lib';
import * as dcorejs from 'dcorejs';

const config = {
    dcoreNetworkWSPaths: ['wss://your.dcore.daemon:8090'],
    chainId: 'your-dcore-chain-id'
};

dcorejs.initialize(config, dcorejs_lib);
```

## Browser

```html
    <script src="./node_modules/dcorejs-lib/dist/bundle.js" type="text/javascript"></script>
    <script src="./dcorejs.umd.js" type="text/javascript"></script>
    <script type="text/javascript">
        var dcorejs_lib = window['dcorejs-lib'];
        var chainId = '17401602b201b3c45a3ad98afc6fb458f91f519bd30d1058adf6f2bed66376bc';
        var dcoreNetworkAddresses = ['wss://stagesocket.decentgo.com:8090'];
        
        dcorejs.initialize({chainId: chainId, dcoreNetworkWSPaths: dcoreNetworkAddresses}, dcorejs_lib);
    </script>
```

Replace `dcoreNetworkWSPaths` with active dcore daemon instance and `chainId` with blockchain id which
you are about to work on.

## Usage

Once dcore lib is initialized, you can access methods using `dcorejs` with any of submodule - `account()`, `asset()`, `content()`, `explorer()`, `messaging()`, `mining()`, `proposal()`, `seeding()` or `subscription()`

## Search content

```typescript
import * as dcorejs from 'dcorejs';

const term = 'some phrase';
const order = dcorejs.SearchParamsOrder.createdDesc;
const user = '1.2.345';
const region_code = 'en';
const itemId = '0.0.0';
const category = '1';
const count = 4;

const searchParams: dcorejs.SearchParams = {
    term, 
    order,
    user, 
    region_code, 
    itemId, 
    category, 
    count
}

dcorejs.content().searchContent(searchParams)
    .then((contents: dcorejs.Content[]) => {
        // process found content
    })
    .catch(err => {
        // handle error
    });
```

Replace all variables with your values to get requested content.
[Search browser example](https://github.com/DECENTfoundation/dcorejs/tree/master/src/examples/SearchContent)

## Buy content

```typescript
import * as dcorejs from 'dcorejs';

const contentId = '2.13.54';
const accountId = '1.2.45';
const privateKey = 'ac7b6876b8a7b68a7c6b8a7c6b8a7cb68a7cb78a6cb8';
const elGammalPublic = '704978309485720398475187405981709436818374592763459872645';

dcorejs.content()
    .buyContent(contentId,
                accountId,
                elGammalPublic,
                privateKey)
    .then(() => {
        // Content successfully bought
    })
    .catch(() => {
        // buy unsuccessful, handle buy error
    });
```

Replace variables with keys from your dcore account to buy content.
Otherwise you will not be able to buy content.
Private key must be in WIF(Wallet Import Format).
[Buy browser example](https://github.com/DECENTfoundation/dcorejs/tree/master/src/examples/BuyContent)

## Download/Restore content

Method `restoreContentKeys` will restore your key generated during content submission, used to encrypt content.

```typescript
import * as dcorejs from 'dcorejs';

const elGamalPrivate = '32983749287349872934792739472387492387492834';
const elGamalPublic = '704978309485720398475187405981709436818374592763459872645';
const elGamalKeyPair = new dcorejs.KeyPair(elGamalPrivate, elGamalPublic);
const contentId = '2.13.312';

// Content key restoration
dcorejs.content().restoreContentKeys(contentId, elGamalKeyPair)
    .then(key => {
        // ... now you are able to decrypt your content
    })
    .catch(err => {
        // error restoring key
    });
```

[Download browser example](https://github.com/DECENTfoundation/dcorejs/tree/master/src/examples/DownloadContent)


## Blockchain event handling
```typescript
dcorejs.subscribe((data: any) => {
    // handle fired event
});

dcorejs.subscribePendingTransaction((data: any) => {
    // handle pending transaction event
});
```

More examples available [here](https://github.com/DECENTfoundation/dcorejs/tree/master/src/examples).
To run examples, you need to clone repository and build with `npm run build`
if folders `dist` and `lib` is not presented. Browser bundle can be found
within `dist/dcorejs.umd.js`. Node version in `lib/dcorejs.js`.

## All available methods

### dcorejs
```typescript
subscribe(callback: ChainSubscriptionCallback)
subscribePendingTransaction(callback: ChainSubscriptionCallback)
```

### Content

```typescript
searchContent(searchParams?: SearchParams, convertAsset: boolean = false): Promise<Content[]>
getContent(id: string, convertAsset: boolean = false): Promise<Content>
getContentURI(URI: string, convertAsset: boolean = false): Promise<Content | null>
removeContent(contentId: string, authorId: string, privateKey: string): Promise<void>
restoreContentKeys(contentId: string, accountId: string, ...elGamalKeys: KeyPair[]): Promise<string>
generateContentKeys(seeders: string[]): Promise<ContentKeys>
addContent(content: SubmitObject, privateKey: string, broadcast: boolean = true): Promise<Operation>
getOpenBuying(convertAsset: boolean = false): Promise<BuyingContent[]>
getOpenBuyingByURI(URI: string, convertAsset: boolean = false): Promise<BuyingContent[]>
getOpenBuyingByConsumer(accountId: string, convertAsset: boolean = false): Promise<BuyingContent[]>
getBuyingByConsumerURI(accountId: string, URI: string, convertAsset: boolean = false): Promise<BuyingContent[] | null>
getBuyingHistoryObjectsByConsumer(accountId: string, convertAsset: boolean = false): Promise<BuyingContent[]>
buyContent(contentId: string,
            buyerId: string,
            elGammalPub: string,
            privateKey: string,
            broadcast: boolean = true): Promise<Operation>
getSeeders(resultSize: number = 100): Promise<Seeder[]>
getPurchasedContent(accountId: string,
                    order: SearchParamsOrder = SearchParamsOrder.createdDesc,
                    startObjectId: string = '0.0.0',
                    term: string = '',
                    resultSize: number = 100): Promise<Content[]>
generateEncryptionKey(): string
getRating(contentId: string, forUser: string, ratingStartId: string, count: number = 100): Promise<Array<Rating>>
searchFeedback(accountId: string, contentURI: string, ratingStartId: string, count: number = 100): Promise<Array<Rating>>
getAuthorCoAuthors(URI: string): Promise<[string, string[]] | null>
leaveCommentAndRating(contentURI: string, consumer: string, comment: string, rating: number, consumerPKey: string): Promise<boolean>
generateEncryptionKey(): string
```

### Account

```typescript
getAccountByName(name: string): Promise<Account>
getAccountById(id: string): Promise<Account>
searchAccountHistory(accountId: string,
                                privateKeys: string[],
                                order: SearchAccountHistoryOrder = SearchAccountHistoryOrder.timeDesc,
                                startObjectId: string = '0.0.0',
                                resultLimit: number = 100): Promise<TransactionRecord[]>
transfer(amount: number,
        assetId: string,
        fromAccount: string,
        toAccount: string,
        memo: string,
        privateKey: string,
        broadcast: boolean = true): Promise<Operation>
getBalance(account: string, assetId: string = '1.3.0', convertAsset: boolean = false): Promise<number>
isTransactionConfirmed(accountId: string, transactionId: string): Promise<boolean>
getAccountHistory(accountId: string, historyOptions?: HistoryOptions): Promise<HistoryRecord[]>
searchAccounts(searchTerm: string, order: AccountOrder, id: string, limit: number = 100): Promise<Account>
getAccountCount(): Promise<number>
registerAccount(name: string,
                           ownerKey: string,
                           activeKey: string,
                           memoKey: string,
                           registrar: string,
                           registrarPrivateKey: string): Promise<Operation>
createAccountWithBrainkey(brainkey: string,
                                     accountName: string,
                                     registrar: string,
                                     registrarPrivateKey: string): Promise<Operation>
exportWallet(accountId: string,
                 password: string,
                 privateKeys: string[],
                 additionalElGamalPrivateKeys: string[] = []): Promise<any>
listAccounts(lowerBound: string = '', limit: number = 100): Promise<AccountNameIdPair[]>
listAccountBalances(id: string, convertAssets: boolean = false): Promise<Asset[]>
searchMinerVoting(accountName: string,
                             keyword: string,
                             myVotes: boolean,
                             sort: MinerOrder,
                             fromMinerId: string,
                             limit: number = 1000): Promise<MinerInfo[]>
updateAccount(accountId: string,
                params: UpdateAccountParameters,
                privateKey: string,
                broadcast: boolean = true): Promise<Boolean>
```

### Asset
```typescript
listAssets(lowerBoundSymbol: string, limit: number = 100, formatAssets: boolean = false): Promise<AssetObject[]>
createUserIssuedAsset(issuer: string,
                                 symbol: string,
                                 precision: number,
                                 description: string,
                                 maxSupply: number,
                                 baseExchangeAmount: number,
                                 quoteExchangeAmount: number,
                                 isExchangeable: boolean,
                                 isSupplyFixed: boolean,
                                 issuerPrivateKey: string): Promise<boolean>
issueAsset(assetSymbol: string, amount: number, issueToAccount: string, memo: string, issuerPKey: string): Promise<boolean>
updateUserIssuedAsset(symbol: string, newInfo: UserIssuedAssetInfo, issuerPKey: string): Promise<boolean>
fundAssetPools(fromAccountId: string,
                          uiaAmount: number,
                          uiaSymbol: string,
                          dctAmount: number,
                          dctSymbol: string,
                          privateKey: string): Promise<boolean>
assetReserve(payer: string, symbol: string, amountToReserve: number, privateKey: string): Promise<boolean>
assetClaimFees(issuer: string,
                          uiaAmount: number,
                          uiaSymbol: string,
                          dctAmount: number,
                          dctSymbol: string,
                          privateKey: string): Promise<boolean>
getAsset(assetId: string, formatAsset: boolean = false): Promise<DCoreAssetObject>
getAssets(assetIds: string[], formatAssets: boolean = false): Promise<DCoreAssetObject[]>
priceToDCT(symbol: string, amount: number): Promise<Asset>
publishAssetFeed(publishingAccount: string,
                            symbol: string,
                            exchangeBaseAmount: number,
                            exchangeQuoteAmount: number,
                            privateKey: string): Promise<boolean>
getFeedsByMiner(minerAccountId: string, limit: number = 100): Promise<any>
getRealSupply(): Promise<RealSupply>
getMonitoredAssetData(assetId: string): Promise<MonitoredAssetOptions | null>
formatAssets(assets: DCoreAssetObject[]): DCoreAssetObject[]
createMonitoredAsset(issuer: string,
                    symbol: string,
                    precision: number,
                    description: string,
                    feedLifetimeSec: number,
                    minimumFeeds: number,
                    issuerPrivateKey: string): Promise<boolean>
updateMonitoredAsset(symbol: string,
                    description: string,
                    feedLifetimeSec: number,
                    minimumFeeds: number,
                    privateKey: string): Promise<boolean>
```

### Explorer 

```typescript
getObject(objectId: string): Promise<any>
getAccount(id: number): Promise<Account>
getAsset(id: number): Promise<Block.Asset> 
getWitness(id: number): Promise<Block.Witness> 
getOperationHistory(id: number): Promise<Block.Transaction> 
getVestingBalance(id: number): Promise<Block.VestingBalance> 
getGlobalProperty(): Promise<Block.GlobalProperty> 
getDynamicGlobalProperty(): Promise<Block.DynamicGlobalProperty> 
getAssetDynamicDataType(id: number): Promise<Block.AssetDynamicProperty> 
getAccountBalance(id: number): Promise<Block.AccountBalance> 
getAccountStatistics(id: number): Promise<Block.AccountStatistics> 
getBlockSummary(id: number): Promise<Block.BlockSummary> 
getAccountTransactionHistory(id: number): Promise<Block.AccountTransactionHistory> 
getChainProperty(id: number): Promise<Block.ChainProperty> 
getWitnessSchedule(id: number): Promise<Block.WitnessSchedule> 
getBudgetRecord(id: number): Promise<Block.BudgetReport> 
getBuying(id: number): Promise<Block.Buying> 
getContent(id: number): Promise<Block.Content> 
getPublisher(id: number): Promise<Block.Publisher> 
getSubscription(id: number): Promise<Block.Subscription> 
getSeedingStatistics(id: number): Promise<Block.SeedingStatistics> 
getTransactionDetail(id: number): Promise<Block.TransactionDetail> 
getBlock(id: number): Promise<Block.Block> 
getBlocks(id: number, count: number): Promise<Array<Block.Block>> 
getAccountCount(): Promise<number> 
getAccounts(...ids: string[]): Promise<Array<Account>> 
getTransaction(blockNo: number, txNum: number): Promise<Block.Transaction> 
listMiners(fromId: string = '0.0.0', limit: number = 100): Promise<Array<Miner>>
getMiners(ids: number[]): Promise<Array<Miner>>
getMiner(id: number): Promise<Miner|null>
getMinerCount(): Promise<number>
getHeadBlockTime(): Promise<string>
```

### Mining

```typescript
setDesiredMinerCount(accountId: string, desiredNumOfMiners: number, privateKey: string): Promise<boolean>
createMiner(minerAccountId: string, URL: string, signingPublicKey: string, privateKey: string): Promise<boolean>
unvoteMiner(miner: string, account: string, privateKeyWif: string): Promise<boolean>
unvoteMiners(miners: string[], account: string, privateKeyWif: string): Promise<boolean>
voteForMiner(miner: string, account: string, privateKeyWif: string): Promise<any>
voteForMiners(miners: string[], account: string, privateKeyWif: string): Promise<any>
voteUnvoteMiners(voteMiners: string[], unvoteMiners: string[], accountId: string, privateKey: string): Promise<boolean>
getVestingBalances(accountId: string): Promise<VestingBalance[]>
updateMiner(minerId: string, minerAccountId: string, updateData: MinerUpdateData, privateKey: string): Promise<boolean>
withdrawVesting(vestinBalanceId: string,
                ownerId: string,
                amount: number,
                assetId: string,
                privateKey: string): Promise<boolean>
setVotingProxy(accountId: string, votingAccountId: string = '', privateKey: string): Promise<boolean>
listMiners(fromId: string, limit: number = 100): Promise<MinerNameIdPair[]>
getMiner(minerId: string): Promise<Miner>
```

### Proposal

```typescript
getProposedTransactions(accountId: string): Promise<ProposalObject[]>
proposeTransfer(proposerAccountId: string,
                fromAccountId: string,
                toAccountId: string,
                amount: number,
                assetId: string,
                memoKey: string,
                expiration: string,
                privateKey: string): Promise<boolean>
proposeParameterChange(proposerAccountId: string,
                        proposalParameters: ProposalParameters,
                        expiration: string,
                        privateKey: string): Promise<boolean>
proposeFeeChange(proposerAccountId: string,
                feesParameters: FeesParameters,
                expiration: string,
                privateKey: string): Promise<boolean>
approveProposal(payingAccountId: string,
                proposalId: string,
                approvalsDelta: DeltaParameters,
                privateKey: string): Promise<boolean>
```

### Seeding

```typescript
listSeedersByPrice(limit: number = 100): Promise<Seeder[]>
listSeedersByUpload(limit: number = 100): Promise<Seeder[]>
listSeedersByRegion(region: string): Promise<Seeder[]>
listSeedersByRating(limit: number = 100): Promise<Seeder[]>
```

### Subscription

```typescript 
listActiveSubscriptionByConsumer(consumerId: string, count: number = 100): Promise<SubscriptionObject[]>
listSubscriptionsByConsumer(consumerId: string, count: number = 100): Promise<SubscriptionObject[]>
listActiveSubscriptionsByAuthor(authorId: string, count: number = 100): Promise<SubscriptionObject[]>
listSubscriptionsByAuthor(authorId: string, count: number = 100): Promise<SubscriptionObject[]>
subscribeToAuthor(from: string, to: string, amount: number, assetId: string, privateKey: string): Promise<boolean>
subscribeByAuthor(from: string, to: string, privateKey: string): Promise<boolean>
setAutomaticRenewalOfSubscription(accountId: string, subscriptionId: string, automaticRenewal: boolean, privateKey: string): Promise<boolean>
setSubscription(accountId: string, options: SubscriptionOptions, privateKey: string): Promise<boolean>
```

### Messaging 
```typescript
getSentMessages(sender: string, decryptPrivateKey: string = '', count: number = 100): Promise<DCoreMessagePayload[]>
getMessages(receiver: string, decryptPrivateKey: string = '', count: number = 100): Promise<any> 
getMessageObjects(sender?: string, receiver?: string, decryptPrivateKey: string = '', count: number = 100): Promise<any>
decryptMessages(messages: DCoreMessagePayload[], decryptPrivateKey: string): DCoreMessagePayload[]
sendMessage(sender: string, receiverId: string, message: string, privateKey: string): Promise<boolean> 
```

### Utils

```typescript
formatToReadiblePrice(dctAmount: number): string
formatAmountForDCTAsset(amount: number): number
formatAmountForAsset(amount: number, asset: DCoreAssetObject): number 
formatAmountToAsset(amount: number, asset: DCoreAssetObject): number 
ripemdHash(fromBuffer: Buffer): string 
generateKeys(fromBrainKey: string): [KeyPrivate, KeyPublic] 
getPublicKey(privateKey: KeyPrivate): KeyPublic
privateKeyFromWif(pkWif: string): KeyPrivate 
publicKeyFromString(pubKeyString: string): KeyPublic 
suggestBrainKey(): string 
getBrainKeyInfo(brainKey: string): BrainKeyInfo 
normalize(brainKey: string): string 
generateNonce(): string 
elGamalPublic(elGamalPrivate: string): string 
elGamalPrivate(privateKeyWif: string): string 
generateElGamalKeys(privateKeyWif: string): ElGamalKeys 
generateBrainKeyElGamalKey(): [BrainKeyInfo, ElGamalKeys] 
derivePrivateKey(brainKey: string, sequence: number): KeyPrivate 
```

### Crypto utils

```typescript
encryptWithChecksum(message: string, privateKey: KeyPrivate, publicKey: KeyPublic, nonce: string = ''): Buffer
decryptWithChecksum(message: string, privateKey: KeyPrivate, publicKey: KeyPublic, nonce: string = ''): Buffer
ripemdHash(fromBuffer: Buffer): string 
md5(message: string): string 
sha512(message: string): string
sha256(message: string): string 
encrypt(message: string, password: string): string 
decrypt(message: string, password: string): string | null 
encryptToHexString(message: string | Buffer, password: string): string 
decryptHexString(message: string, password: string): string
```

### Transaction builder

```typescript
addOperation(operation: Operation): string
propose(proposalParameters: ProposalCreateParameters): void
broadcast(privateKey: string, sign: boolean = true): Promise<void>
signTransaction(privateKey: KeyPrivate): void
replaceOperation(operationIndex: number, newOperation: Operation): boolean
previewTransaction(): any
```