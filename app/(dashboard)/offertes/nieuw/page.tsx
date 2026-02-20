import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const OfferteEditor = dynamic(
  () => import("@/components/offerte-editor/offerte-editor"),
  {
    loading: () => (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
);

export default function NieuweOffertePage() {
  return <OfferteEditor />;
}
