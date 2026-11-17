
import "./globals.css";
import localFont from "next/font/local";
import { cn } from "@/lib/utils";

const almarai = localFont({
  src: [
    {
      path: "./fonts/almarai/Almarai-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/almarai/Almarai-ExtraBold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-almarai",
  display: "swap",
});

const alexandria = localFont({
  src: [
    {
      path: "./fonts/alexandria/Alexandria-Regular.ttf",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/alexandria/Alexandria-Bold.ttf",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-alexandria",
  display: "swap",
});

export const metadata = {
  title: "Bekia - منصة إدارة المخلفات وإعادة التدوير للشركات",
  description: "منصة إدارة المخلفات وإعادة التدوير للشركات",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#047857",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ar"
      dir="rtl"
      className={cn(almarai.variable, alexandria.variable)}
    >
      <body className="min-h-screen w-full font-sans antialiased">
        {children}
      </body>
    </html>
  );
}
