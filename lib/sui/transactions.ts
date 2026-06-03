import { Transaction } from "@mysten/sui/transactions";
import { env } from "@/lib/env";

const SUI_CLOCK_OBJECT_ID = "0x6";
const SUI_OBJECT_ID_PATTERN = /^0x[0-9a-fA-F]+$/;

function requirePackageId() {
  if (!env.packageId) {
    throw new Error("NEXT_PUBLIC_PACKAGE_ID is not configured. Deploy the Move package and set the package ID before anchoring proofs.");
  }

  if (!SUI_OBJECT_ID_PATTERN.test(env.packageId)) {
    throw new Error("NEXT_PUBLIC_PACKAGE_ID must be a Sui object ID beginning with 0x.");
  }

  return env.packageId;
}

export function buildCreateProjectTx(args: {
  title: string;
  tagline: string;
  category: string;
  manifestBlobId: string;
  manifestHash: string;
}) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${requirePackageId()}::vouch::create_project`,
    arguments: [
      tx.pure.string(args.title),
      tx.pure.string(args.tagline),
      tx.pure.string(args.category),
      tx.pure.string(args.manifestBlobId),
      tx.pure.string(args.manifestHash),
      tx.object(SUI_CLOCK_OBJECT_ID)
    ]
  });

  return tx;
}

export function buildUpdateProjectTx(args: {
  projectId: string;
  manifestBlobId: string;
  manifestHash: string;
  note: string;
}) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${requirePackageId()}::vouch::update_project`,
    arguments: [
      tx.object(args.projectId),
      tx.pure.string(args.manifestBlobId),
      tx.pure.string(args.manifestHash),
      tx.pure.string(args.note),
      tx.object(SUI_CLOCK_OBJECT_ID)
    ]
  });

  return tx;
}

export function buildDeactivateProjectTx(projectId: string) {
  const tx = new Transaction();

  tx.moveCall({
    target: `${requirePackageId()}::vouch::deactivate_project`,
    arguments: [tx.object(projectId)]
  });

  return tx;
}
