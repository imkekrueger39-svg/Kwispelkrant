import Link from 'next/link';
import Nieuwsfeed from './latest-news/nieuwsfeed';
import { alleArtikelen } from '../../lib/artikelen';
import { Artikelbeeld, Artikelkaarten, Artikelmeta, Bloem } from './onderdelen';

export const revalidate = 3600;

export default async function Voorpagina() {
  const artikelen = await alleArtikelen();
  const hoofdartikel = artikelen.find(({ entry }) => entry.uitgelicht) ?? artikelen[0];

  return (
    <>
      <h1 className="visueel-verborgen">Kwispelkrant</h1>
      <section className="quizblok" aria-labelledby="quizblok-titel">
        <span className="quizblok-poot" aria-hidden="true">🐾</span>
        <div>
          <h2 id="quizblok-titel">Welke hond past bij jou? <Bloem /></h2>
          <p>Ben jij een avontuurlijke herder, een gezellige knuffelhond of een sociale allemansvriend?</p>
        </div>
        <Link className="knop" href="/quiz">Ontdek jouw hondenmatch!</Link>
      </section>
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
      <Nieuwsfeed />
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
