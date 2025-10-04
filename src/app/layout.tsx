import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"   // 👈 esto fuerza dark por defecto
          enableSystem={false} // 👈 ignora el tema del sistema
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
