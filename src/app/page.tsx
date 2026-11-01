import { Hero } from "@/components/hero/Hero";
import { Secoes } from "@/components/secoes/Secoes";

const negocioLocal = {
  "@context": "https://schema.org",
  "@type": "NailSalon",
  name: "Yas Nail Art",
  telephone: "+5521970645952",
  address: { "@type": "PostalAddress", addressLocality: "Rio de Janeiro", addressRegion: "RJ", addressCountry: "BR" },
  geo: { "@type": "GeoCoordinates", latitude: -22.9508304, longitude: -43.3772798 },
  openingHours: ["Tu-Fr 09:00-20:00", "Sa 10:00-18:00"],
  sameAs: ["https://www.instagram.com/yasnailart._"],
};

export default function Home() {
  return (
    <main>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(negocioLocal) }} />
      <Hero />
      <Secoes />
    </main>
  );
}
