
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Mur de Prière",
  description: "Un lieu pour déposer et porter les prières.",
  icons: {
    icon: "/images/favicon.svg", // Chemin vers ton favicon
  },
};


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
      <ToastContainer 
        position="top-right"
        autoClose={3000} // Temps de fermeture automatique (en ms)
        hideProgressBar
        closeOnClick
        pauseOnHover
        draggable
        theme="colored" // Choix du thème : "light", "dark", "colored"
      />

      {children}
      </body>
    </html>
  );
}

