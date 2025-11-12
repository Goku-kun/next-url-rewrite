import { Metadata } from "next";

export const metadata: Metadata = {
  title: "App Router Example - Next URL Rewrite",
  description: "Testing URL rewrites with @next-url-rewrite/next",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
