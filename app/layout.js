import { Geist } from "next/font/google";
import "./globals.css";
import SiteHeader from "../components/site-header";
import SiteFooter from "../components/site-footer";
import { BuyerLanguageProvider } from "../components/buyer-language-provider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata = {
  title: "DriveHub | Company A · Brand X",
  description: "Explore new and used Brand X vehicles with Company A in Lucknow.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" data-scroll-behavior="smooth" className={`${geistSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <BuyerLanguageProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </BuyerLanguageProvider>
      </body>
    </html>
  );
}
