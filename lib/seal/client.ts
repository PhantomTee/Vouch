import { SealClient } from "@mysten/seal";
import { fromHex, toHex } from "@mysten/sui/utils";
import { env } from "@/lib/env";

// Official Mysten Labs decentralized key server on Sui testnet.
export const SEAL_KEY_SERVER_OBJ_ID =
  "0xb012378c9f3799fb5b1a7083da74a4069e3c3f1c93de0b27212a5799ce1e1e98";
export const SEAL_AGGREGATOR_URL =
  "https://seal-aggregator-testnet.mystenlabs.com";

/** Build a Seal id: ownerAddress bytes (32) ++ random 5-byte nonce. */
export function buildSealId(ownerAddress: string): string {
  const nonce = crypto.getRandomValues(new Uint8Array(5));
  const ownerBytes = fromHex(ownerAddress);
  return toHex(new Uint8Array([...ownerBytes, ...nonce]));
}

/** Encrypt a file's raw bytes for the owner. Returns encrypted blob + the seal id to store. */
export async function encryptForOwner(
  suiClient: any,
  fileData: Uint8Array,
  ownerAddress: string,
): Promise<{ encryptedBytes: Uint8Array; sealId: string }> {
  if (!env.packageId)
    throw new Error(
      "NEXT_PUBLIC_PACKAGE_ID must be set before encrypting evidence with Seal.",
    );
  const client = new SealClient({
    suiClient,
    serverConfigs: [
      { objectId: SEAL_KEY_SERVER_OBJ_ID, weight: 1, aggregatorUrl: SEAL_AGGREGATOR_URL },
    ],
    verifyKeyServers: false,
  });
  const id = buildSealId(ownerAddress);
  const { encryptedObject } = await client.encrypt({
    threshold: 1,
    packageId: env.packageId,
    id,
    data: fileData,
  });
  return { encryptedBytes: encryptedObject, sealId: id };
}
