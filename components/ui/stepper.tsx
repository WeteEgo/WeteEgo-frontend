interface Step {
  id: string;
  label: string;
}

interface StepperProps {
  steps: Step[];
  activeId: string;
}

export function Stepper({ steps, activeId }: StepperProps) {
  return (
    <ol className="flex items-center gap-3 text-xs" aria-label="Conversion steps">
      {steps.map((step, index) => {
        const isActive = step.id === activeId;
        const isCompleted = steps.findIndex((s) => s.id === activeId) > index;

        return (
          <li key={step.id} className="flex items-center gap-2">
            <span
              className={[
                "inline-flex h-5 w-5 items-center justify-center rounded-full border text-[0.6rem]",
                isCompleted
                  ? "border-emerald-400 bg-emerald-500/20 text-emerald-100"
                  : isActive
                    ? "border-blue-400 bg-blue-500/20 text-blue-100"
                    : "border-[var(--border-subtle)] bg-surface-muted/40 text-[var(--text-muted)]",
              ]
                .filter(Boolean)
                .join(" ")}
            >
              {index + 1}
            </span>
            <span
              className={
                isActive || isCompleted
                  ? "font-medium text-slate-100"
                  : "text-[var(--text-muted)]"
              }
            >
              {step.label}
            </span>
            {index < steps.length - 1 && (
              <span className="h-px w-5 bg-[var(--border-subtle)]/60" aria-hidden="true" />
            )}
          </li>
        );
      })}
    </ol>
  );
}

