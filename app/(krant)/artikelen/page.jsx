import Link from 'next/link';
import { categories } from '../../../keystatic.config';
import { alleArtikelen } from '../../../lib/artikelen';
import { Artikelkaarten, Bloem } from '../onderdelen';

export const metadata = { title: 'Artikelen' };

export default async function Artikelen({ searchParams }) {
  const { categorie } = await searchParams;
  const gekozen = categories.find(({ value }) => value === categorie);
  const artikelen = await alleArtikelen();
  const resultaten = gekozen ? artikelen.filter(({ entry }) => entry.categorie === gekozen.value) : artikelen;

  return (
    <>
      <div className="paginakop"><h1>Artikelen <Bloem /></h1></div>
      <nav className="filters" aria-label="Filter op categorie">
        <Link href="/artikelen" aria-current={!gekozen ? 'page' : undefined}>Alle artikelen</Link>
        {categories.map(({ label, value }) => (
          <Link key={value} href={`/artikelen?categorie=${value}`} aria-current={gekozen?.value === value ? 'page' : undefined}>{label}</Link>
        ))}
      </nav>
      <section aria-labelledby="resultaten">
        <h2 id="resultaten" className="visueel-verborgen">{gekozen?.label ?? 'Alle artikelen'}</h2>
        {resultaten.length ? <Artikelkaarten artikelen={resultaten} /> : <p className="leeg">In deze categorie staan nog geen artikelen.</p>}
      </section>
    </>
  );
}
