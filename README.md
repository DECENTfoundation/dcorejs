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

# dcore-js

Javascript library to work with Dcore blockchain network.

## Quick start

### Installation

 1. Install `Node.js >6` and `npm >3` globally

 2. Change directory to project root dir

 3. Install `npm install dcore-js`

 4. Install dcore dependency library using
    `npm install git+ssh://git@github.com/DECENTfoundation/dcore`

### Initialize library

```javascript
import * as dcore from 'dcore';
import * as dcore_js from 'dcore-js';

const config = {
    dcoreNetworkWSPaths: ['wss://your.dcore.daemon:8090'],
    chainId: 'your-dcore-chain-id'
};

dcore_js.initialize(config, dcore);
```

Replace `dcoreNetworkWSPaths` with active dcore daemon instance and `chainId` with blockchain id which
you are about to work on.

## Usage

Once dcore lib is initialized, you can access methods using `dcore` with any of submodule - `account()`, `content()` or `explorer()`

## Search content

```javascript
import * as dcore from 'dcore-js';

const term = 'some phrase';
const order = dcore.SearchParamsOrder.createdDesc;
const user = '1.2.345';
const region_code = 'en';
const itemId = '0.0.0';
const category = '1';
const count = 4;

const searchParams: dcore.SearchParams = new dcore.SearchParams(
    term, order, user, region_code, itemId, category, count
);

dcore.content().searchContent(searchParams)
    .then((contents: dcore.Content[]) => {
        // process found content
    })
    .catch(err => {
        // handle error
    });
```

Replace all variables with your values to get requested content.
[Search example](https://github.com/DECENTfoundation/dcore-js/tree/master/src/examples/SearchContent)

## Buy content

```javascript
import * as dcore from 'dcore-js';

const contentId = '1.2.3';
const accountId = '1.3.45';dcore
const privateKey = 'ac7b6876b8a7b68a7c6b8a7c6b8a7cb68a7cb78a6cb8';
const elGammalPublic = '704978309485720398475187405981709436818374592763459872645';

dcore.content()
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
[Buy example](https://github.com/DECENTfoundation/dcore-js/tree/master/src/examples/BuyContent)

## Download/Restore content

Method `restoreContentKeys` will restore your key generated during content submission, used to encrypt content.

```javascript
import * as dcore from 'dcore-js';

const elGamalPrivate = '32983749287349872934792739472387492387492834';
const elGamalPublic = '704978309485720398475187405981709436818374592763459872645';
const elGamalKeyPair = new dcore.KeyPair(elGamalPrivate, elGamalPublic);
const contentId = '1.2.312';

// Content key restoration
dcore.content().restoreContentKeys(contentId, elGamalKeyPair)
    .then(key => {
        // ... now you are able to decrypt your content
    })
    .catch(err => {
        // error restoring key
    });
```

[Download example](https://github.com/DECENTfoundation/dcore-js/tree/master/src/examples/DownloadContent)

More examples available [here](https://github.com/DECENTfoundation/dcore-js/tree/master/src/examples).
To run examples, you need to clone repository and build with `npm run build`
if folders `dist` and `lib` is not presented. Browser bundle can be found
within `dist/bundle.js`. Node version in `lib/dcore-js.js`.

## All available methods

### Content

```typescript
searchContent(searchParams: SearchParams): Promise<Content[]>

getContent(id: string): Promise<Content>

removeContent(contentId: string,
              authorId: string,
              privateKey: string): Promise<void>

restoreContentKeys(contentId: String,
                   accountId: string,
                   ...elGamalKeys: KeyPair[]): Promise<string>

generateContentKeys(seeders: string[]): Promise<ContentKeys>

addContent(content: SubmitObject,
           privateKey: string): Promise<void>

buyContent(contentId: string,
           buyerId: string,
           elGammalPub: string,
           privateKey: string): Promise<void>

getSeeders(resultSize: number): Promise<Seeder[]>

getPurchasedContent(accountId: string,
                    order: string,
                    startObjectId: string,
                    term: string,
                    resultSize: number): Promise<Content[]>
```

### Account

```typescript
getAccountByName(name: string): Promise<Account>

getAccountById(id: string): Promise<Account>

getTransactionHistory(accountId: string,
                      privateKeys: string[],
                      order: string,
                      startObjectId: string,
                      resultLimit: number): Promise<TransactionRecord[]>

transfer(amount: number,
         fromAccount: string,
         toAccount: string,
         memo: string,
         privateKey: string): Promise<void>

getBalance(account: string): Promise<number>
```

### Utils

```typescript
formatToReadiblePrice(dctAmount: number): string

ripemdHash(fromBuffer: Buffer): string

generateKeys(fromBrainKey: string): (KeyPrivate | KeyPublic)[]

getPublicKey(privkey: KeyPrivate): KeyPublic

privateKeyFromWif(pkWif: string): KeyPrivate

publicKeyFromString(pubKeyString: string): KeyPublic
```
