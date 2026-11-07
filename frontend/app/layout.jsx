import './globals.css';

export const metadata = {
  title: 'Bekia - منصة إدارة المخلفات وإعادة التدوير للشركات  ',
  description: 'منصة إدارة المخلفات وإعادة التدوير للشركات',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#047857',
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
