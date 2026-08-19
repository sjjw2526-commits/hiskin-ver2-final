/**
 * Hover text roll: the label slides up and out while an identical copy
 * rises into its place. The parent link must carry the `group/roll` class.
 */
export default function RollText({
  children,
  className = "",
}: {
  children: string;
  className?: string;
}) {
  return (
    <span className={`relative block overflow-hidden ${className}`}>
      <span className="block transition-transform duration-[450ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/roll:-translate-y-full group-focus-visible/roll:-translate-y-full">
        {children}
      </span>
      <span
        aria-hidden
        className="absolute left-0 top-0 block translate-y-full transition-transform duration-[450ms] ease-[cubic-bezier(0.76,0,0.24,1)] group-hover/roll:translate-y-0 group-focus-visible/roll:translate-y-0"
      >
        {children}
      </span>
    </span>
  );
}
