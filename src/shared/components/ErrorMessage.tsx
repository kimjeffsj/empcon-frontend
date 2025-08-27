import { Button } from "../ui/button";

interface ErrorMessageProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  showRetry?: boolean;
}

export const ErrorMessage = ({
  title = "Error",
  message,
  onRetry,
  showRetry = true,
}: ErrorMessageProps) => {
  return (
    <div className="min-h-64 flex items-center justify-center">
      <div className="text-center">
        <div className="text-red-600 mb-2">
          <h3 className="font-medium">{title}</h3>
        </div>
        <p className="text-muted-foreground mb-4">{message}</p>
        {showRetry && onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
};
