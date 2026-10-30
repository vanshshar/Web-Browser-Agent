export function ErrorDisplay({
  message,
  onDismiss,
}: {
  message: string;
  onDismiss?: () => void;
}) {
  return (
    <div
      className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start justify-between shadow-sm"
      role="alert"
    >
      <div className="flex items-start gap-3">
        <svg
          className="h-5 w-5 text-rose-600 mt-0.5 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span className="text-sm font-medium">{message}</span>
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="text-rose-500 hover:text-rose-800 font-bold ml-4"
          aria-label="Dismiss error"
        >
          ×
        </button>
      )}
    </div>
  );
}

