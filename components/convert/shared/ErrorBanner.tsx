"use client";

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ message, onRetry, onDismiss }: ErrorBannerProps) {
  return (
    <Alert variant="error">
      <div className="flex items-start justify-between gap-2">
        <p>{message}</p>
        <div className="flex shrink-0 gap-1">
          {onRetry && (
            <Button variant="ghost" size="sm" onClick={onRetry} className="text-red-200 hover:text-white">
              Retry
            </Button>
          )}
          {onDismiss && (
            <Button variant="ghost" size="sm" onClick={onDismiss} className="text-red-200 hover:text-white">
              Dismiss
            </Button>
          )}
        </div>
      </div>
    </Alert>
  );
}
