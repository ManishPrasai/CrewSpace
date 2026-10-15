import { ImageResponse } from "next/og";

export const runtime = "nodejs";

// Maskable icon: OS may crop to a circle/squircle, so content must stay
// inside the inner 80% safe zone. Mark sized well within that, on the
// ink background per handoff/README.md.
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: 512,
          height: 512,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#1A1A19",
        }}
      >
        <svg width="280" height="280" viewBox="0 0 32 32" fill="none">
          <path d="M12 17A5 5 0 0 1 17 12H20V15A5 5 0 0 1 15 20H12Z" fill="oklch(0.74 0.08 200)" />
          <rect x="3" y="3" width="17" height="17" rx="5" fill="none" stroke="#FFFFFF" strokeWidth="2.2" />
          <path
            d="M17 12H24A5 5 0 0 1 29 17V24A5 5 0 0 1 24 29H12V17A5 5 0 0 1 17 12Z"
            fill="none"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
