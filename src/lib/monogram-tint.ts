// Six tints for avatar/workspace monograms, picked deterministically from
// a hash of an id/slug (handoff/02-visual-design-spec.md: "one of six
// tints... Halden-style teal is only one of the six"). tokens.css only
// defines the brand hue (200) at this soft/ink lightness-chroma pair; the
// other five reuse the same oklch(L C H) formula at different hues so
// contrast stays consistent across all six (oklch's L channel controls
// perceptual lightness directly, unlike hex/hsl).
const HUES = [200, 30, 95, 150, 280, 340];

function hashToIndex(id: string, mod: number): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(hash) % mod;
}

export function monogramTint(id: string): { bg: string; fg: string } {
  const hue = HUES[hashToIndex(id, HUES.length)];
  return {
    bg: `oklch(0.955 0.022 ${hue})`,
    fg: `oklch(0.4 0.075 ${hue})`,
  };
}
