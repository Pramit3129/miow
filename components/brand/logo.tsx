/** One Sovereign wordmark. Type only, no symbol. */
export function Logo({ className }: { className?: string }) {
  return (
    <span className={"logo" + (className ? " " + className : "")} aria-label="One Sovereign">
      <span className="logo-word" aria-hidden="true">
        One Sovereign
      </span>
    </span>
  );
}
