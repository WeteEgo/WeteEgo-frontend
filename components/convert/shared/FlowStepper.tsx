"use client";

import type { FlowStep } from "@/lib/flow-types";

interface StepDef {
  id: string;
  label: string;
  flowSteps: FlowStep[];
}

const STEPS: StepDef[] = [
  { id: "amount", label: "Amount", flowSteps: ["amount"] },
  { id: "bank", label: "Bank", flowSteps: ["bank"] },
  { id: "review", label: "Review", flowSteps: ["review"] },
  { id: "pay", label: "Pay", flowSteps: ["approve", "convert"] },
  { id: "done", label: "Done", flowSteps: ["tracking"] },
];

function getVisualIndex(currentStep: FlowStep): number {
  return STEPS.findIndex((s) => s.flowSteps.includes(currentStep));
}

interface FlowStepperProps {
  currentStep: FlowStep;
}

export function FlowStepper({ currentStep }: FlowStepperProps) {
  const activeIdx = getVisualIndex(currentStep);

  return (
    <>
      {/* Desktop: full stepper */}
      <ol className="hidden sm:flex items-center gap-1 text-xs" aria-label="Conversion steps">
        {STEPS.map((step, index) => {
          const isCompleted = index < activeIdx;
          const isActive = index === activeIdx;

          return (
            <li key={step.id} className="flex items-center gap-1.5">
              <span
                className={[
                  "inline-flex h-6 w-6 items-center justify-center rounded-full text-[0.65rem] font-medium transition-colors",
                  isCompleted
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                    : isActive
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/40"
                      : "bg-slate-800/60 text-slate-500 border border-slate-700/40",
                ].join(" ")}
              >
                {isCompleted ? (
                  <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={
                  isActive
                    ? "font-medium text-slate-100"
                    : isCompleted
                      ? "text-slate-400"
                      : "text-slate-600"
                }
              >
                {step.label}
              </span>
              {index < STEPS.length - 1 && (
                <span
                  className={[
                    "h-px w-4 transition-colors",
                    index < activeIdx ? "bg-emerald-500/40" : "bg-slate-700/40",
                  ].join(" ")}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: compact */}
      <p className="sm:hidden text-xs text-[var(--text-muted)]">
        Step {activeIdx + 1} of {STEPS.length}
        <span className="mx-1.5 text-slate-600">·</span>
        <span className="font-medium text-slate-200">
          {STEPS[activeIdx]?.label ?? ""}
        </span>
      </p>
    </>
  );
}
