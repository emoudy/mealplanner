interface LoadingAnnouncerProps {
  isLoading: boolean;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
  error?: Error | null;
}

export function LoadingAnnouncer({ 
  isLoading, 
  loadingMessage = "Loading...", 
  successMessage = "Content loaded",
  errorMessage = "Error occurred",
  error 
}: LoadingAnnouncerProps) {
  const getMessage = () => {
    if (error) return `${errorMessage}: ${error.message}`;
    if (isLoading) return loadingMessage;
    return successMessage;
  };

  return (
    <div 
      aria-live="polite" 
      aria-atomic="true"
      className="sr-only"
      role="status"
    >
      {getMessage()}
    </div>
  );
}