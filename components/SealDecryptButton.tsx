"use client";

import { useCurrentAccount, useSignPersonalMessage, useSuiClient } from "@mysten/dapp-kit";
import { EncryptedObject, NoAccessError, SealClient, SessionKey } from "@mysten/seal";
import { Transaction } from "@mysten/sui/transactions";
import { fromHex } from "@mysten/sui/utils";
import { Lock } from "lucide-react";
import { useState } from "react";
import { env } from "@/lib/env";
import { SEAL_AGGREGATOR_URL, SEAL_KEY_SERVER_OBJ_ID } from "@/lib/seal/client";
import { fetchWalrusBlobRaw } from "@/lib/walrus/client";

export function SealDecryptButton({
  walrusBlobId,
  fileName,
  mimeType,
}: {
  walrusBlobId: string;
  fileName: string;
  mimeType: string;
}) {
  const account = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutateAsync: signPersonalMessage } = useSignPersonalMessage();
  const [status, setStatus] = useState<"idle" | "busy" | "error">("idle");
  const [errMsg, setErrMsg] = useState("");

  if (!account?.address) return null;

  async function decrypt() {
    if (!account?.address || !env.packageId) {
      setErrMsg("Wallet not connected or package ID not set.");
      setStatus("error");
      return;
    }
    setStatus("busy");
    setErrMsg("");
    try {
      // 1. Fetch encrypted bytes from Walrus
      const raw = await fetchWalrusBlobRaw(walrusBlobId);
      if (!raw.ok) throw new Error(raw.message);
      const encryptedBytes = new Uint8Array(raw.data);

      // 2. Parse the Seal id embedded in the ciphertext
      const parsedId = EncryptedObject.parse(encryptedBytes).id;
      const idBytes = Array.from(fromHex(parsedId));

      // 3. Create SealClient
      const sealClient = new SealClient({ suiClient: suiClient as any, serverConfigs: [{ objectId: SEAL_KEY_SERVER_OBJ_ID, weight: 1, aggregatorUrl: SEAL_AGGREGATOR_URL }], verifyKeyServers: false });

      // 4. Create session key (no signer — we'll sign manually via wallet)
      const sessionKey = await SessionKey.create({ address: account.address, packageId: env.packageId, ttlMin: 10, suiClient: suiClient as any });

      // 5. Sign the personal message with the connected wallet
      const personalMsg = sessionKey.getPersonalMessage();
      const { signature } = await signPersonalMessage({ message: personalMsg });
      await sessionKey.setPersonalMessageSignature(signature);

      // 6. Build the seal_approve PTB
      const tx = new Transaction();
      tx.moveCall({ target: `${env.packageId}::vouch::seal_approve`, arguments: [tx.pure.vector("u8", idBytes)] });
      const txBytes = await tx.build({ client: suiClient as any, onlyTransactionKind: true });

      // 7. Decrypt
      const decrypted = await sealClient.decrypt({ data: encryptedBytes, sessionKey, txBytes });

      // 8. Trigger browser download
      const blob = new Blob([decrypted.slice()], { type: mimeType || "application/octet-stream" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
      setStatus("idle");
    } catch (e) {
      const msg =
        e instanceof NoAccessError
          ? "Access denied — only the owner can decrypt this file."
          : e instanceof Error
          ? e.message
          : "Decryption failed.";
      setErrMsg(msg);
      setStatus("error");
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        onClick={decrypt}
        disabled={status === "busy"}
        className="btn-neo flex items-center gap-1.5 bg-ink px-3 py-1.5 text-xs text-white disabled:opacity-60"
      >
        <Lock size={11} />
        {status === "busy" ? "Decrypting…" : "Decrypt"}
      </button>
      {status === "error" && <p className="font-mono text-xs text-coral">{errMsg}</p>}
    </div>
  );
}
