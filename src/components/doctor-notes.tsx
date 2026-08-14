"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

export function DoctorNotes({
  notes,
  onNotesChange,
}: {
  notes: string;
  onNotesChange: (value: string) => void;
}) {
  const [saved, setSaved] = useState(false);

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <h2 className="mb-4 text-lg font-semibold text-slate-900">
        Doctor Notes
      </h2>
      <Textarea
        placeholder="Add your notes here..."
        value={notes}
        onChange={(e) => {
          onNotesChange(e.target.value);
          setSaved(false);
        }}
        className="min-h-28"
      />
      <Button
        className="mt-3"
        variant="outline"
        onClick={() => {
          setSaved(true);
          setTimeout(() => setSaved(false), 1500);
        }}
      >
        {saved ? <Check className="size-4 text-emerald-600" /> : null}
        {saved ? "Saved" : "Save Review"}
      </Button>
    </div>
  );
}
