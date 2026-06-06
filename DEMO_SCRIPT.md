# Vouch Demo Script

Target length: 2-3 minutes.

## 0:00-0:25 - Problem

Hackathon judges and grant reviewers often receive GitHub links, demo URLs, screenshots, and social posts. Those links are useful, but they are not a durable proof of what existed before the deadline. Git history can be rewritten, demo links can change, and screenshots can be replaced.

## 0:25-0:45 - Solution

Vouch creates a build receipt. A builder uploads evidence, Vouch stores it on Walrus, anchors the manifest hash on Sui, and lets anyone verify the result through Tatum Sui RPC.

## 0:45-1:15 - Create HackProof

Open the HackProof page. Fill in the project name, short description, GitHub repo URL, live demo URL, demo video URL, Sui package/object/transaction reference, and X or LinkedIn post URL. Connect the builder wallet and sign in with GitHub so the wallet, repo, and GitHub identity are linked in the proof metadata.

## 1:15-1:40 - Walrus Evidence

Upload screenshots, a README, architecture notes, or other evidence files. Vouch hashes each file in the browser, uploads the evidence to Walrus decentralized storage, then creates a JSON manifest containing the file hashes, Walrus blob IDs, project metadata, timestamp, network, and builder wallet.

## 1:40-2:00 - Sui Anchor

Vouch hashes the manifest and asks the wallet to sign one Sui transaction. The Sui proof object stores the Walrus manifest blob ID and manifest hash, giving the submission a public blockchain timestamp.

## 2:00-2:35 - Tatum Verification

Open the public proof page. Show the certificate: project details, builder wallet, GitHub/demo links, Walrus evidence, Sui proof object, active network, timestamp, and the Tatum Infra Status card. Then open the verifier and show the checks pass: Sui object exists, proof was read through Tatum RPC, manifest hash matches, Walrus evidence is present, GitHub repo and demo URL exist in metadata, wallet matches, network is visible, and timestamp is visible.

## 2:35-2:50 - Closing

Vouch gives judges a tamper-evident build receipt instead of a pile of mutable links. Even if the Vouch frontend disappears, the evidence remains verifiable through Walrus and Sui.
