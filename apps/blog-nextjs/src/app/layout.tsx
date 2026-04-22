import "./globals.css";
import React from "react";
import { NavBar } from "#components/NavBar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`h-full`}>
      <body className="min-h-full flex flex-col">
        <NavBar></NavBar>
        <div id="container" className="p-4">
          {children}
        </div>
      </body>
    </html>
  );
}
