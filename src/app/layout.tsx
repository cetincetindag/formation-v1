import "~/styles/globals.css";
import { GeistSans } from "geist/font/sans";

import { type Metadata } from "next";
import { Toaster } from "~/components/ui/toaster";

export const metadata: Metadata = {
  title: "Formation",
  description: "Form sharing easier than ever",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${GeistSans.variable}`}>
      <body className="flex flex-col justify-center items-center bg-black text-white">
        <div>
          <h1 className="text-lg text-white">
            formation - development build v3.1
          </h1>
        </div>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
