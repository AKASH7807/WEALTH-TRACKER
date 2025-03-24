import "./globals.css";
import "./font.css"
import Header from "@/components/header";
import { ClerkProvider } from "@clerk/nextjs";
import { Toaster } from "sonner";


export const metadata = {
  title: "wealth",
  description: "WealthTrack Simplifying Your Financial Path",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <ClerkProvider>
        <body>
          {/* header  */}
          <Header />
          <main className="min-h-screen"> {children}</main>
          <Toaster richColors />
          {/* footer */}
          <footer className="bg-blue-50 py-8">
            <div className="container mx-auto px-4 text-center text-gray-600">
              <p>©️ <a href="https://akash--dev.web.app/" target="_blank" className="font-extrabold text-blue-600">Akash M</a>. All rights reserved.</p>
            </div>
          </footer>
        </body>
      </ClerkProvider>
    </html>
  );
}
