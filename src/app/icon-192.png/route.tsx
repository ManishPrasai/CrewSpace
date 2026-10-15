import { ImageResponse } from "next/og";

export const runtime = "nodejs";

function Mark({ size, stroke }: { size: number; stroke: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" fill="none">
      <path d="M12 17A5 5 0 0 1 17 12H20V15A5 5 0 0 1 15 20H12Z" fill="oklch(0.5 0.085 200)" />
      <rect x="3" y="3" width="17" height="17" rx="5" fill="none" stroke="#1A1A19" strokeWidth={stroke} />
      <path
        d="M17 12H24A5 5 0 0 1 29 17V24A5 5 0 0 1 24 29H12V17A5 5 0 0 1 17 12Z"
        fill="none"
        stroke="#1A1A19"
        strokeWidth={stroke}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 192,
          height: 192,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#FFFFFF",
        }}
      >
        <Mark size={144} stroke={2.4} />
      </div>
    ),
    { width: 192, height: 192 },
  );
}
