import { Outfit, Inter } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "WorkHub | Bolsa de Trabajo",
  description: "Encuentra tu próxima oportunidad laboral",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className={`${outfit.variable} ${inter.variable}`}>
      <body className="font-[family-name:var(--font-inter)] antialiased">
        {children}
      </body>
    </html>
  );
}