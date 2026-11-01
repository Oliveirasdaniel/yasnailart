import type { Metadata } from "next";
import type { ReactNode } from "react";
import localFont from "next/font/local";
import "@/styles/globals.css";

const archivo = localFont({
  src: "../../public/fonts/archivo.woff2",
  weight: "100 900",
  declarations: [{ prop: "font-stretch", value: "62% 125%" }],
  variable: "--font-archivo",
});
const caprasimo = localFont({ src: "../../public/fonts/caprasimo.woff2", variable: "--font-caprasimo" });
const playball = localFont({ src: "../../public/fonts/playball.woff2", variable: "--font-playball" });
// Provisória até a Yas informar a fonte do post "um artista é uma criança que insistiu"
const titulo = localFont({ src: "../../public/fonts/galindo.woff2", variable: "--font-titulo" });

export const metadata: Metadata = {
  title: "Yas Nail Art | Nail art em Jacarepaguá, RJ",
  description: "Nail art, 3D e cartoon. Alongamentos em gel e press on em Jacarepaguá, RJ.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="pt-BR"
      className={`${archivo.variable} ${caprasimo.variable} ${playball.variable} ${titulo.variable}`}
    >
      <body>{children}</body>
    </html>
  );
}
