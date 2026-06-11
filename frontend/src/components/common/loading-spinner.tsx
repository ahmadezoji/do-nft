export const LoadingSpinner = ({ size = "md" }: { size?: "sm" | "md" | "lg" }) => (
  <span className={`loading-spinner loading-spinner-${size}`} aria-hidden="true" />
);
