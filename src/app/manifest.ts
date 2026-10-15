import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Crewspace",
    short_name: "Crewspace",
    description: "Invite your team, post announcements, and manage members in one shared workspace.",
    start_url: "/workspaces",
    display: "standalone",
    background_color: "#F4F4F2",
    theme_color: "#1A1A19",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
