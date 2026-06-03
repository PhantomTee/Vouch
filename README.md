# Vouch

**Vouch is a verifiable proof-of-build registry for Sui projects. It stores project evidence on Walrus, anchors proof hashes on Sui, and uses Tatum RPC to make every build easy to verify and share.**

Hackathon projects, grant submissions, and builder portfolios often depend on mutable links. Vouch gives each build a signed, timestamped proof record with evidence stored on Walrus and proof hashes anchored on Sui.

## Why it matters

Builders need a simple way to prove that a project existed at a point in time, with evidence that can be independently checked. Vouch turns project artifacts into a manifest, hashes every file in the browser, uploads files and the manifest to Walrus, then records the manifest hash and blob ID on Sui.

## Hackathon fit

- **Meaningful Walrus storage integration:** evidence files and the manifest JSON are uploaded through a configurable Walrus publisher, and public pages can fetch manifests through a Walrus aggregator.
- **Real Tatum Sui RPC usage:** `lib/tatum/rpc.ts` calls the configured Tatum Sui JSON-RPC gateway and includes `x-api-key` when provided.
- **Sui Testnet/Mainnet support:** environment variables select network, Tatum gateway, deployed package ID, and object links.
- **2–3 minute demo UX:** create proof, upload evidence, anchor on Sui, and share `/vouch/[objectId]`.

## Architecture

```text
Builder browser
  ├─ hashes files with Web Crypto SHA-256
  ├─ uploads evidence blobs ───────────────► Walrus Publisher
  ├─ creates + uploads manifest JSON ──────► Walrus Publisher
  ├─ signs Sui transaction with wallet ────► Sui Move package: vouch::vouch
  └─ reads proof page ─────► Tatum Sui RPC ─► Sui object state/events
                         └► Walrus Aggregator ─► manifest JSON
```

## Tech stack

- Next.js App Router, TypeScript, Tailwind CSS
- Sui dapp-kit wallet connection
- `@mysten/sui` transaction builder helpers in `lib/sui/transactions.ts`
- Tatum Sui JSON-RPC wrapper
- Walrus HTTP publisher/aggregator wrapper
- LottieFiles React player with safe CSS fallbacks
- Sui Move package in `move/`

## Environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_APP_NAME=Vouch
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_TATUM_SUI_RPC_URL=https://sui-testnet.gateway.tatum.io
NEXT_PUBLIC_TATUM_API_KEY=
NEXT_PUBLIC_PACKAGE_ID=
NEXT_PUBLIC_REGISTRY_ID=
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=
```

Never commit private API keys. The browser app only reads public `NEXT_PUBLIC_*` values. For production, prefer a server-side proxy if your Tatum key should not be exposed.

## Run locally

```bash
npm install
npm run dev
```

Quality checks:

```bash
npm run lint
npm run typecheck
npm run build
```


## Deploy on Vercel

This repository includes `vercel.json` so Vercel treats the project as a Next.js app and runs the same production build command used locally.

1. Import the repository in Vercel.
2. Keep the project root as the repository root.
3. Add the environment variables from `.env.example` in the Vercel project settings.
4. Deploy. Vercel should run `npm install` and `npm run build`, then serve the App Router routes from `.next`.

If Vercel shows a platform `404: NOT_FOUND` immediately after import, verify that the deployment finished successfully and that the project root is not pointed at `move/` or another subdirectory.

## Deploy the Move package

Install and configure the Sui CLI, then publish to testnet:

```bash
sui client switch --env testnet
sui client publish move --gas-budget 100000000
```

After publishing, copy the package ID into `.env.local`:

```env
NEXT_PUBLIC_PACKAGE_ID=0xYOUR_PACKAGE_ID
```

The frontend transaction helper calls:

- `vouch::vouch::create_project`
- `vouch::vouch::update_project`
- `vouch::vouch::deactivate_project`

The contract emits `ProjectCreated` and `ProjectUpdated` events for indexing.

## Configure Tatum Sui RPC

Use the Tatum Sui gateway URL for your selected network:

- Testnet: `https://sui-testnet.gateway.tatum.io`
- Mainnet: `https://sui-mainnet.gateway.tatum.io`

Set `NEXT_PUBLIC_TATUM_API_KEY` if your gateway requires authentication. Vouch sends it as the `x-api-key` header and performs a lightweight `sui_getProtocolConfig` status check.

References:

- https://docs.tatum.io/reference/rpc-sui
- https://tatum.io/chain/sui
- https://docs.sui.io/sui-api-ref

## Configure Walrus

Set a Walrus publisher and aggregator URL:

```env
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.example
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.example
```

Vouch uses the Walrus HTTP store/read pattern:

- `PUT {publisher}/v1/blobs` for evidence and manifest uploads
- `GET {aggregator}/v1/blobs/{blobId}` for manifest reads

If the publisher is not configured, Vouch returns a typed error and does **not** fake successful Walrus uploads.

References:

- https://docs.wal.app/
- https://walrus.xyz/

## Demo flow

1. Open `/` and point out the Tatum RPC status card and Walrus config card.
2. Click **Create Vouch**.
3. Connect a Sui wallet.
4. Enter project metadata and add one evidence file.
5. Submit. Vouch hashes files, uploads evidence to Walrus, uploads the manifest to Walrus, then asks the wallet to anchor on Sui.
6. Share the generated `/vouch/[objectId]` page.
7. On the proof page, show Sui object ID, transaction digest, manifest hash, Walrus blob ID, evidence hashes, and explorer links.

## Contract addresses

| Network | Package ID | Notes |
| --- | --- | --- |
| Sui Testnet | `TODO` | Set `NEXT_PUBLIC_PACKAGE_ID` after publish. |
| Sui Mainnet | `TODO` | Optional production deployment. |

## Screenshots

Add screenshots after deployment:

- Landing page
- Create Vouch flow
- Public proof verification page

## Known limitations

- Explore and My Proofs use browser local cache in the MVP. The Move contract emits events so full indexing can be added with `suix_queryEvents`.
- Tatum API keys in `NEXT_PUBLIC_*` variables are visible to browsers. Use a server route or proxy for production key secrecy.
- Lottie JSON files are optional; components render CSS/icon fallbacks until files are added to `public/animations/`.
- Walrus publisher/aggregator CORS behavior depends on the deployed endpoint.

## Future work

- Add a backend/indexer for global event search and owner filtering.
- Add update proof flow for new versions.
- Add server-side Tatum key proxy.
- Add manifest integrity re-hashing on the proof page.
- Add richer deployment badges for Sui package/object links.
