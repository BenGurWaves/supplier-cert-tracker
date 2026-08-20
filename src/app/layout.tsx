import NavigationHeader from '@/components/Navbar';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0, fontFamily: 'sans-serif' }}>
        <NavigationHeader />
        <main style={{ padding: '20px 30px' }}>
          {children}
        </main>
      </body>
    </html>
  );
}
