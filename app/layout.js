import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { Analytics } from "@vercel/analytics/next";
import { GoogleAnalytics } from "@next/third-parties/google"; // ✅ AJOUT

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mur de Prière - Déposez vos prières, priez pour les autres",
  description:
    "Plateforme chrétienne pour déposer vos sujets de prière ou soutenir les autres dans la prière. Ensemble, unis dans la foi.",
  openGraph: {
    title: "Mur de Prière",
    description: "Un espace de foi pour prier les uns pour les autres",
    url: "https://www.mur-de-priere.com",
    siteName: "Mur de Prière",
    type: "website",
  },
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  const gaId = process.env.NEXT_PUBLIC_GA_ID; // ✅ AJOUT

  return (
    <html lang="fr">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar
          closeOnClick
          pauseOnHover
          draggable
          theme="colored"
        />

        {children}

        {/* Vercel Analytics (déjà présent, on ne touche pas) */}
        <Analytics />

        {/* Google Analytics 4 */}
        {gaId && <GoogleAnalytics gaId={gaId} />}
      </body>
    </html>
  );
}
