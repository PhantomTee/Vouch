# Vouch

**Proof-of-build registry for Sui. Anchor project evidence on Walrus, lock the hash on Sui, verify it anywhere.**

Live: [vouch-proof.vercel.app](https://vouch-proof.vercel.app)

---

## What it does

Builders submit projects to hackathons and grant programs using links that can be edited or deleted after the deadline. Git history can be rewritten. Screenshots can be staged. Vouch fixes this.

When you create a Vouch proof:

1. Every evidence file is SHA-256 hashed in the browser
2. Files are uploaded to Walrus decentralised storage
3. A JSON manifest collecting all hashes and project metadata is created and also uploaded to Walrus
4. The manifest hash and Walrus blob ID are anchored on Sui via a signed wallet transaction

The resulting Sui object has an immutable blockchain timestamp. Anyone can independently fetch the manifest from Walrus, re-hash it, and confirm it matches the on-chain record. No trust in Vouch required.

---

## Features

- **GitHub identity verification** - Sign in with GitHub OAuth before creating a proof. Your username is embedded in the manifest, cryptographically linking your GitHub identity to your Sui wallet. Impersonation is impossible.
- **GitHub repo import** - Import project name, tagline, description, category, and README directly from any public repo in one click.
- **Walrus evidence storage** - Upload screenshots, PDFs, READMEs, architecture diagrams, and other build artifacts. Each file is individually hashed before upload.
- **Sui Seal encryption** - Toggle any evidence file to Private. Files are encrypted client-side using Sui Seal before going to Walrus. Only the owner wallet can decrypt them. Not even Vouch can read private files.
- **On-chain anchoring via Tatum RPC** - Proof pages read Sui state directly through the Tatum Sui JSON-RPC gateway. No Vouch servers are involved in verification.
- **Independent verification tool** - Paste any proof URL at `/verify`. The tool re-fetches the Walrus blob, re-computes the SHA-256, and compares it to the on-chain hash step by step.
- **SuiNS resolution** - Owner addresses resolve to `.sui` names where available.
- **Update proof** - Add new evidence files to an existing proof. Each update increments the version number and re-anchors a new manifest on Sui.
- **Public builder profiles** - Every GitHub user gets a profile page at `/u/[username]` listing all their verified proofs.
- **Explore with search and filter** - Browse all proofs by category or search by title, tagline, or wallet address.
- **Vouch Grants** - Funders lock SUI on-chain against a specific build milestone. The builder uploads completion evidence to Walrus and anchors the proof hash on Sui. The funder reviews the evidence and releases the funds. If the builder has not yet submitted, the funder can cancel and reclaim their SUI. The full escrow lifecycle lives entirely on-chain with no intermediary.

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind CSS |
| Wallet | Sui dapp-kit, @mysten/sui |
| On-chain reads | Tatum Sui JSON-RPC (`lib/tatum/rpc.ts`) |
| Decentralised storage | Walrus HTTP publisher + aggregator |
| Encryption | Sui Seal threshold encryption (`@mysten/seal`) |
| Identity | NextAuth.js with GitHub OAuth provider |
| Name resolution | SuiNS via `suix_resolveNameServiceNames` |
| Proof contract | Sui Move 2024 edition (`move/sources/vouch.move`) |
| Grants contract | Sui Move 2024 edition (`move/sources/vouch_grants.move`) |

---

## How it works

### Proof creation

```
Browser
  ├── SHA-256 hash each file (Web Crypto API)
  ├── [optional] Seal-encrypt private files before upload
  ├── Upload evidence files ──────────────► Walrus Publisher
  ├── Build + upload manifest JSON ───────► Walrus Publisher
  ├── Sign Sui transaction ───────────────► vouch::vouch::create_project
  │
  └── Proof page
        ├── Read VouchProject object ──────► Tatum Sui RPC
        └── Fetch manifest ────────────────► Walrus Aggregator
```

The Move contract stores `manifest_blob_id` and `manifest_hash` on-chain. The verification tool uses these two values to independently confirm the manifest has not been altered.

### Vouch Grants flow

```
Builder
  └── create_milestone(projectId, title, description, rewardMist)
        └── Milestone object shared on Sui, status: open

Funder
  └── fund_milestone(milestoneId, coin)
        └── SUI locked in escrow inside the Milestone object, status: funded

Builder (after completing the work)
  ├── SHA-256 hash each completion evidence file
  ├── Upload evidence files ──────────────► Walrus Publisher
  ├── Build + upload completion manifest ─► Walrus Publisher
  └── submit_proof(milestoneId, proofBlobId, proofHash)
        └── Walrus blob ID + manifest hash anchored on Sui, status: submitted

Funder (after reviewing on-chain evidence)
  └── release_funds(milestoneId)
        └── Escrowed SUI transferred to builder, status: released

  or

  └── cancel_and_refund(milestoneId)    [only before builder submits]
        └── Escrowed SUI returned to funder, status: cancelled
```

All state transitions are enforced by the Move contract. The funder cannot release to anyone other than the builder. The builder cannot submit proof before funding. No party can bypass the escrow.

---

## Contracts

Both contracts are deployed on Sui Testnet.

### vouch (proof registry)

| Field | Value |
|---|---|
| Package ID | `0x900febc5ddfd0ff86b07c765ebfefce0d0b9fda1ef26f72dfb8e3a17d4340b30` |
| Network | Sui Testnet |

Entry functions:

- `vouch::vouch::create_project` - create a new proof object
- `vouch::vouch::update_project` - append new evidence and re-anchor
- `vouch::vouch::deactivate_project` - deactivate a proof
- `vouch::vouch::seal_approve` - Sui Seal access policy (owner-only decryption)

Events emitted:

- `ProjectCreated` - indexed by the Explore page via `suix_queryEvents`
- `ProjectUpdated` - tracks version history

### vouch_grants (milestone escrow)

| Field | Value |
|---|---|
| Package ID | `0x43bfb194938bd12abf1f51a0155f05d90150f2d8b3ff2cece1094663cef19dd7` |
| Network | Sui Testnet |

Entry functions:

- `grants::create_milestone` - builder creates a milestone linked to a VouchProject object ID
- `grants::fund_milestone` - funder deposits exact SUI into the milestone escrow
- `grants::submit_proof` - builder submits a Walrus blob ID and manifest hash as completion proof
- `grants::release_funds` - funder approves the proof and transfers SUI to the builder
- `grants::cancel_and_refund` - funder cancels before proof is submitted and reclaims SUI

Events emitted:

- `MilestoneCreated` - indexed by `/grants` explorer via `suix_queryEvents`
- `MilestoneFunded` - records funder address and timestamp
- `ProofSubmitted` - records Walrus blob ID and proof hash on-chain
- `FundsReleased` - records payout amount and timestamp
- `MilestoneCancelled` - records cancellation

---

## Local setup

```bash
cp .env.example .env.local
# fill in TATUM_API_KEY, GitHub OAuth credentials, and NEXTAUTH_SECRET
npm install
npm run dev
```

```bash
npm run typecheck
npm run build
```

---

## Environment variables

The contract addresses below point to the live deployed contracts on Sui Testnet and are pre-filled in `.env.example`. You only need to supply your own Tatum API key, GitHub OAuth credentials, and NextAuth secret.

```env
NEXT_PUBLIC_APP_NAME=Vouch
NEXT_PUBLIC_SUI_NETWORK=testnet
NEXT_PUBLIC_TATUM_SUI_RPC_URL=https://sui-testnet.gateway.tatum.io
NEXT_PUBLIC_TATUM_API_KEY=your_tatum_key
NEXT_PUBLIC_PACKAGE_ID=0x900febc5ddfd0ff86b07c765ebfefce0d0b9fda1ef26f72dfb8e3a17d4340b30
NEXT_PUBLIC_GRANTS_PACKAGE_ID=0x43bfb194938bd12abf1f51a0155f05d90150f2d8b3ff2cece1094663cef19dd7
NEXT_PUBLIC_WALRUS_PUBLISHER_URL=https://publisher.walrus-testnet.walrus.space
NEXT_PUBLIC_WALRUS_AGGREGATOR_URL=https://aggregator.walrus-testnet.walrus.space
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
NEXTAUTH_SECRET=your_nextauth_secret
NEXTAUTH_URL=https://your-deployment-url.vercel.app
```

The Tatum API key is available at [tatum.io](https://tatum.io) after creating a free account. GitHub OAuth credentials come from a [GitHub OAuth App](https://github.com/settings/developers).

---

## Walrus endpoints

Vouch uses the standard Walrus HTTP API:

- `PUT {publisher}/v1/blobs` for uploads
- `GET {aggregator}/v1/blobs/{blobId}` for reads

Public Walrus testnet endpoints are pre-configured in the deployed app.

---

## Tatum RPC

All on-chain reads go through the Tatum Sui gateway. The API key is sent as the `x-api-key` header. In the browser, requests are proxied through `/api/rpc` to avoid CORS issues with SDK-injected headers.

Docs: [docs.tatum.io/reference/rpc-sui](https://docs.tatum.io/reference/rpc-sui)

---

## Sui Seal

Private evidence files are encrypted using Sui Seal before upload. The encryption ID is derived from the owner's wallet address, creating an owner-only access policy enforced by the `seal_approve` entry function in the Move contract.

The Seal key server used: `0xb012378c9f3799fb5b1a7083da74a4069e3c3f1c93de0b27212a5799ce1e1e98`

Docs: [seal-docs.wal.app](https://seal-docs.wal.app)

---

## What Vouch proves and does not prove

**Vouch proves:**
- The wallet that signed the anchoring transaction
- The GitHub account linked to the proof at submission time
- The exact timestamp of the Sui transaction
- The Walrus blob ID where the evidence manifest is stored
- The SHA-256 hash of every evidence file at upload time
- That none of the above has been altered since anchoring

**Vouch does not claim:**
- That every line of code was written during a specific time window
- That the project works as described
- That private off-chain work was included unless evidence was uploaded
- That the GitHub account represents the sole contributor

Vouch is a notary, not a judge. It proves what evidence existed, when it was anchored, and who anchored it.
