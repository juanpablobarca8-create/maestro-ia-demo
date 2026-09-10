import type { Metadata } from "next";
import "../styles/globals.css";

export const metadata: Metadata = {
  title: "Maestro Fit IA",
  description: "Tu asistente de calorías y macros con IA",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="apple-mobile-web-app-capable" content="true" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Maestro Fit IA" />
      </head>
      <body>{children}</body>
    </html>
  );
}
