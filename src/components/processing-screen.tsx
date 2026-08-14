"use client";

import { useEffect, useState } from "react";
import { Check, Loader2, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  "File uploaded",
  "Extracting text",
  "Identifying medical values",
  "Analyzing report",
  "Generating summary",
];

const STEP_DELAY_MS = 700;

type ProcessingScreenProps = {
  done: boolean;
  onComplete: () => void;
};

export function ProcessingScreen({ done, onComplete }: ProcessingScreenProps) {
  const [activeStep, setActiveStep] = useState(0);

  // Advance through the visual checklist, but hold on the last step until
  // the real extraction + AI request actually finishes.
  useEffect(() => {
    if (activeStep >= STEPS.length - 1) return;
    const timer = setTimeout(() => setActiveStep((s) => s + 1), STEP_DELAY_MS);
    return () => clearTimeout(timer);
  }, [activeStep]);

  useEffect(() => {
    if (!done) return;
    const finishTimer = setTimeout(() => {
      setActiveStep(STEPS.length);
      onComplete();
    }, 400);
    return () => clearTimeout(finishTimer);
  }, [done, onComplete]);

  return (
    <div className="mx-auto flex w-full max-w-md flex-col items-center gap-8 py-16">
      <Loader2 className="size-8 animate-spin text-blue-600" />
      <div className="text-center">
        <h2 className="text-xl font-semibold text-slate-900">
          Processing your report...
        </h2>
      </div>

      <div className="flex w-full flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6">
        {STEPS.map((step, i) => {
          const isDone = i < activeStep;
          const isActive = i === activeStep;
          return (
            <div key={step} className="flex items-center gap-3">
              {isDone ? (
                <Check className="size-5 shrink-0 text-emerald-500" />
              ) : isActive ? (
                <Loader2 className="size-5 shrink-0 animate-spin text-blue-600" />
              ) : (
                <Circle className="size-5 shrink-0 text-slate-300" />
              )}
              <span
                className={cn(
                  "text-sm",
                  isDone && "text-slate-500",
                  isActive && "font-medium text-slate-900",
                  !isDone && !isActive && "text-slate-400"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
