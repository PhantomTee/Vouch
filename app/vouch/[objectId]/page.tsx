import { ProofViewer } from "@/components/ProofViewer";

export default function VouchPage({ params }: { params: { objectId: string } }) {
  return <ProofViewer objectId={params.objectId} />;
}
