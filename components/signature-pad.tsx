"use client";

import { useRef, useEffect } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface SignaturePadProps {
  onSave: (signature: string) => void;
  onClear?: () => void;
  value?: string;
}

export function SignaturePad({ onSave, onClear, value }: SignaturePadProps) {
  const sigCanvas = useRef<SignatureCanvas>(null);

  useEffect(() => {
    if (value && sigCanvas.current) {
      sigCanvas.current.fromDataURL(value);
    }
  }, [value]);

  const clear = () => {
    sigCanvas.current?.clear();
    onClear?.();
  };

  const save = () => {
    if (sigCanvas.current) {
      const signature = sigCanvas.current.toDataURL();
      onSave(signature);
    }
  };

  return (
    <Card className="p-4 space-y-4">
      <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white">
        <SignatureCanvas
          ref={sigCanvas}
          canvasProps={{
            className: "w-full h-40 touch-none",
          }}
          backgroundColor="rgb(255, 255, 255)"
        />
      </div>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={clear}>
          Wissen
        </Button>
        <Button type="button" onClick={save}>
          Handtekening Opslaan
        </Button>
      </div>
    </Card>
  );
}

