// "Commons" mark (handoff/02-visual-design-spec.md, handoff/03-components.md):
// two 17-unit rounded squares offset by 9 units on a 32 grid; the overlap
// is a filled leaf. The lower square has one sharp corner (bottom-left),
// reading as a speech bubble.
export function BrandMark({
  size = 24,
  variant = "full",
  tone = "auto",
  className,
}: {
  size?: number;
  variant?: "full" | "leaf";
  tone?: "auto" | "onDark";
  className?: string;
}) {
  // Stroke scales with size per spec: 2.2 at >=64px, 2.6-2.8 at 20-26px, 3.2+ at <=16px.
  const strokeWidth = size <= 16 ? 3.2 : size <= 26 ? 2.7 : size >= 64 ? 2.2 : 2.4;
  const stroke = tone === "onDark" ? "#FFFFFF" : "currentColor";

  if (variant === "leaf") {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        className={className}
        aria-hidden="true"
      >
        <path d="M10 18A7 7 0 0 1 17 11H21V15A7 7 0 0 1 14 22H10Z" fill="var(--brand)" />
      </svg>
    );
  }

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 17A5 5 0 0 1 17 12H20V15A5 5 0 0 1 15 20H12Z" fill="var(--brand)" />
      <rect x="3" y="3" width="17" height="17" rx="5" fill="none" stroke={stroke} strokeWidth={strokeWidth} />
      <path
        d="M17 12H24A5 5 0 0 1 29 17V24A5 5 0 0 1 24 29H12V17A5 5 0 0 1 17 12Z"
        fill="none"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinejoin="round"
      />
    </svg>
  );
}
