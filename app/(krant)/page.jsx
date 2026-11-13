import Link from 'next/link';
import { alleArtikelen } from '../../lib/artikelen';
import { Artikelbeeld, Artikelkaarten, Artikelmeta, Bloem } from './onderdelen';

export default async function Voorpagina() {
  const artikelen = await alleArtikelen();
  const hoofdartikel = artikelen.find(({ entry }) => entry.uitgelicht) ?? artikelen[0];

  return (
    <>
      <h1 className="visueel-verborgen">Kwispelkrant</h1>
      {hoofdartikel && (
        <section className="uitgelicht" aria-labelledby="hoofdartikel">
          <div className="uitgelicht-tekst">
            <p className="rubriek"><Bloem /> Uitgelicht</p>
            <Artikelmeta entry={hoofdartikel.entry} />
            <h2 id="hoofdartikel">{hoofdartikel.entry.titel}</h2>
            <p>{hoofdartikel.entry.samenvatting}</p>
            <Link className="knop" href={`/artikelen/${hoofdartikel.slug}`}>Lees het artikel <span aria-hidden="true">↗</span></Link>
          </div>
          <Artikelbeeld entry={hoofdartikel.entry} prioriteit />
        </section>
      )}
      <section className="recent" aria-labelledby="laatste">
        <div className="sectiekop">
          <h2 id="laatste">Laatste nieuws <Bloem /></h2>
          <Link href="/artikelen">Alle artikelen <span aria-hidden="true">↗</span></Link>
        </div>
        {artikelen.length ? <Artikelkaarten artikelen={artikelen.slice(0, 3)} /> : <p>Er zijn nog geen artikelen.</p>}
      </section>
    </>
  );
}
