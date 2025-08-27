interface LoadingIndicatorProps {
  message?: string;
  fullScreen?: boolean;
}

export const LoadingIndicator = ({
  message = "Loading...",
  fullScreen = false,
}: LoadingIndicatorProps) => {
  return (
    <div
      className={`${
        fullScreen ? "min-h-screen" : "min-h-64"
      } flex items-center justify-center`}
    >
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">{message}</p>
      </div>
    </div>
  );
};
