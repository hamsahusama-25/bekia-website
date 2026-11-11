import './globals.css';
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata = {
  title: 'Bekia',
  description: 'منصة إدارة المخلفات وإعادة التدوير للشركات',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#047857',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl" className={cn("font-sans", geist.variable)}>
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
