import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sacred India — Temple & Pilgrimage Guide",
    template: "%s · Sacred India",
  },
  description:
    "A thoughtful guide to India's sacred places, their stories, darshan timings, festivals, and visitor information.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
