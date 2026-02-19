"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

export function FacturerenButton({ offerteId }: { offerteId: string }) {
  const router = useRouter();

  return (
    <Button
      onClick={() => router.push(`/facturen/nieuw?offerteId=${offerteId}`)}
      variant="default"
    >
      <FileText className="mr-2 h-4 w-4" />
      Maak Factuur
    </Button>
  );
}
