import { ImageResponse } from "next/og";

export const runtime = "nodejs";

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
          background: "#FFFFFF",
        }}
      >
        <svg width="384" height="384" viewBox="0 0 32 32" fill="none">
          <path d="M12 17A5 5 0 0 1 17 12H20V15A5 5 0 0 1 15 20H12Z" fill="oklch(0.5 0.085 200)" />
          <rect x="3" y="3" width="17" height="17" rx="5" fill="none" stroke="#1A1A19" strokeWidth="2.2" />
          <path
            d="M17 12H24A5 5 0 0 1 29 17V24A5 5 0 0 1 24 29H12V17A5 5 0 0 1 17 12Z"
            fill="none"
            stroke="#1A1A19"
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    ),
    { width: 512, height: 512 },
  );
}
