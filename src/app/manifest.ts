import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Crewspace",
    short_name: "Crewspace",
    description: "Invite your team, post announcements, and manage members in one shared workspace.",
    start_url: "/workspaces",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e293b",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
