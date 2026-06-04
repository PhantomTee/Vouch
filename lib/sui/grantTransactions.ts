import { Transaction } from "@mysten/sui/transactions";
import { env } from "@/lib/env";

const SUI_CLOCK_OBJECT_ID = "0x6";

function requireGrantsPackageId() {
  if (!env.grantsPackageId)
    throw new Error("NEXT_PUBLIC_GRANTS_PACKAGE_ID is not configured.");
  return env.grantsPackageId;
}

export function buildCreateMilestoneTx(args: {
  projectId: string;
  title: string;
  description: string;
  rewardMist: bigint;
}) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${requireGrantsPackageId()}::grants::create_milestone`,
    arguments: [
      tx.pure.id(args.projectId),
      tx.pure.string(args.title),
      tx.pure.string(args.description),
      tx.pure.u64(args.rewardMist),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  return tx;
}

export function buildFundMilestoneTx(args: {
  milestoneId: string;
  rewardMist: bigint;
}) {
  const tx = new Transaction();
  const [coin] = tx.splitCoins(tx.gas, [tx.pure.u64(args.rewardMist)]);
  tx.moveCall({
    target: `${requireGrantsPackageId()}::grants::fund_milestone`,
    arguments: [
      tx.object(args.milestoneId),
      coin,
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  return tx;
}

export function buildSubmitProofTx(args: {
  milestoneId: string;
  proofBlobId: string;
  proofHash: string;
}) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${requireGrantsPackageId()}::grants::submit_proof`,
    arguments: [
      tx.object(args.milestoneId),
      tx.pure.string(args.proofBlobId),
      tx.pure.string(args.proofHash),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  return tx;
}

export function buildReleaseFundsTx(args: { milestoneId: string }) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${requireGrantsPackageId()}::grants::release_funds`,
    arguments: [
      tx.object(args.milestoneId),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  return tx;
}

export function buildCancelAndRefundTx(args: { milestoneId: string }) {
  const tx = new Transaction();
  tx.moveCall({
    target: `${requireGrantsPackageId()}::grants::cancel_and_refund`,
    arguments: [
      tx.object(args.milestoneId),
      tx.object(SUI_CLOCK_OBJECT_ID),
    ],
  });
  return tx;
}
